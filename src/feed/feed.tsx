import React, {
    ComponentProps,
    FC,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';

import { binarySearch } from './binary-search';

type Props = Omit<ComponentProps<'div'>, 'children'> & {
  threshold: number;
  children: (startIndex: number) => ReactNode[];
  onReadHeight?: (element: Element, index: number) => number;
}

const defaultReadHeight: Props['onReadHeight'] = (element) => element.clientHeight;

export const Feed: FC<Props> = (props) => {
  const {
    children,
    threshold,
    onReadHeight = defaultReadHeight,
    ...divProps
  } = props;

  const [startIndex, setStartIndex] = useState(0);
  const offsetsRef = useRef<number[]>([]);
  const itemsRef = useRef<HTMLDivElement>(null);
  const itemsSliceRef = useRef<HTMLDivElement>(null);

  const startIndexRef = useRef(startIndex);
  startIndexRef.current = startIndex;

  const childrenRef = useRef(children);
  childrenRef.current = children;

  const onReadHeightRef = useRef(onReadHeight);
  onReadHeightRef.current = onReadHeight;

  const calcOffsets = useCallback(
    (height: number, index: number): number => {
      const offsets = offsetsRef.current;
      const prevOffset = offsets[index] || 0;

      offsets[index] = index 
          ? height + offsets[index - 1]
          : height;

      // redefine offsets by diff
      const diff = offsets[index] - prevOffset;
      if (diff > 0) {
        for (
          let nextIndex = index + 1;
          nextIndex < offsets.length;
          ++nextIndex
        ) {
          offsets[nextIndex] += diff;
        }
      }

      return offsets[index];
    },
    [],
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const {
        scrollTop,
      } = e.target as HTMLDivElement;

      queueMicrotask(() => {
        const offsets = offsetsRef.current;

        const [, foundIndex] = binarySearch(offsets, (offset, index) => {
          const prevOffest = offsets[index - 1] || 0;
          const isFound = offset >= scrollTop && scrollTop > prevOffest;
  
          if (isFound) {
            return 0;
          }
          return scrollTop - offset;
        });

        const nextStartIndex = Math.max(foundIndex - (threshold - 1), 0);
        setStartIndex(nextStartIndex);
      });
    },
    [threshold],
  );

  useEffect(
    () => {
      const items = itemsRef.current;
      const itemsSlice = itemsSliceRef.current;
      if (!items || !itemsSlice) {
        return;
      }

      Array
        .from(itemsSlice.children)
        .forEach(async (node, index) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }
          /**
           * skip extra read height, but always read first element.
           */
          if (index > 0 && node.dataset.index) {
            return;
          }
          const indexOfList = startIndex + index;
          node.dataset.index = String(indexOfList);
          const clientHeight = onReadHeightRef.current(node, indexOfList);
          calcOffsets(clientHeight, indexOfList);
        });

      queueMicrotask(() => {
        const offsets = offsetsRef.current;
        items.style.minHeight = `${offsets[offsets.length - 1]}px`;
        const top = offsets[startIndex] - offsets[0];
        itemsSlice.style.transform = `translateY(${top}px)`;
      });
    },
    [calcOffsets, startIndex],
  );

  return (
    <div
      {...divProps}
      onScroll={handleScroll}
    >
      <div ref={itemsRef}>
        <div 
          ref={itemsSliceRef}
          style={{position: 'relative'}}  
        >
          {childrenRef.current(startIndex)}
        </div>
      </div>
    </div>
  );
};
