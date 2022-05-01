import React, {
    ComponentProps,
    FC,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';

import { binarySearch } from './binary-search';

import './feed.css';

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
    className = '',
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
          : 0;

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

      const offsets = offsetsRef.current;

      queueMicrotask(() => {
        const [, foundIndex] = binarySearch(offsets, (offset, index) => {
          const prevOffest = offsets[index - 1] || 0;
          const isFound = offset >= scrollTop && scrollTop > prevOffest;
  
          if (isFound) {
            return 0;
          }
          return scrollTop - offset;
        });

        const nextStartIndex = Math.max(foundIndex - threshold, 0);
        setStartIndex(nextStartIndex);
      });
    },
    [threshold],
  );

  const items = useMemo(
    () => childrenRef.current(startIndex),
    [startIndex],
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
          const indexOfList = startIndex + index;
          const clientHeight = onReadHeightRef.current(node, indexOfList);
          calcOffsets(clientHeight, indexOfList);
        });

      queueMicrotask(() => {
        const offsets = offsetsRef.current;
        items.style.minHeight = `${offsets[offsets.length - 1]}px`;
        itemsSlice.style.width = '100%';
        itemsSlice.style.position = 'absolute';
        itemsSlice.style.transform = `translateY(${offsets[startIndex]}px)`;
      });
    },
    [calcOffsets, startIndex],
  );

  return (
    <div
      {...divProps}
      className={`feed ${className}`.trim()}
      onScroll={handleScroll}
    >
      <div
        ref={itemsRef}
        className="feed-items"
      >
        <div 
          ref={itemsSliceRef}
        >
          {items}
        </div>
      </div>
    </div>
  );
};
