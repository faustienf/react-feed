import React, {
    ComponentProps,
    FC,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from 'react';
import { feedContext } from './feed-context';

type Props = ComponentProps<'div'> & {
  onReadHeight?: (element: HTMLElement, index: number) => number;
}

const defaultReadHeight: Props['onReadHeight'] = (element) => element.clientHeight;

export const Feed: FC<Props> = (props) => {
  const {
    children,
    onReadHeight = defaultReadHeight,
    ...divProps
  } = props;

  const {
    startIndex,
    offsets,
  } = useContext(feedContext);

  const itemsRef = useRef<HTMLDivElement>(null);
  const itemsSliceRef = useRef<HTMLDivElement>(null);

  const startIndexRef = useRef(startIndex);
  startIndexRef.current = startIndex;

  const onReadHeightRef = useRef(onReadHeight);
  onReadHeightRef.current = onReadHeight;

  const calcOffsets = useCallback(
    (height: number, index: number) => {
      const prevOffset = offsets.get(index - 1) || 0;
      const currentOffset = offsets.get(index) || 0;
      const newCurrentOffset = index 
        ? height + prevOffset
        : height;

      offsets.set(index, newCurrentOffset);

      // redefine offsets by diff
      const diff = newCurrentOffset - currentOffset;
      if (diff > 0) {
        for (
          let nextIndex = index + 1;
          nextIndex < offsets.size;
          ++nextIndex
        ) {
          const nextOffset = offsets.get(nextIndex) || 0;
          offsets.set(nextIndex, nextOffset + diff)
        }
      }
    },
    [offsets],
  );

  useEffect(
    () => {
      const items = itemsRef.current;
      const itemsSlice = itemsSliceRef.current;
      if (!items || !itemsSlice) {
        return;
      }

      const resizeObserver = new ResizeObserver(() => {
        Array
          .from(itemsSlice.children)
          .forEach(async (node, index) => {
            if (!(node instanceof HTMLElement)) {
              return;
            }
            /**
             * Skip extra read height. 
             */
            if (node.dataset.index) {
              return;
            }
            const indexOfList = startIndex + index;
            node.dataset.index = String(indexOfList);
            const clientHeight = onReadHeightRef.current(node, indexOfList);
            calcOffsets(clientHeight, indexOfList);
          });

          queueMicrotask(() => {
            const lastOffset = offsets.get(offsets.size - 1) || 0;
            const prevOffset = offsets.get(startIndex - 1) || 0;
            items.style.minHeight = `${lastOffset}px`;
            itemsSlice.style.transform = `translateY(${prevOffset}px)`;
          });
      });

      resizeObserver.observe(itemsSlice);

      return () => {
        resizeObserver.disconnect();
      }
    },
    [calcOffsets, offsets, startIndex],
  );

  const lastOffset = offsets.get(offsets.size - 1) || 0;
  const prevOffset = offsets.get(startIndex - 1) || 0;

  return (
    <div
      style={{
        willChange: 'min-height',
        minHeight: lastOffset,
      }}
      {...divProps}
      ref={itemsRef}
    >
      <div 
        ref={itemsSliceRef}
        style={{
          willChange: 'transform',
          transform: `translateY(${prevOffset}px)`,
        }}  
      >
        {children}
      </div>
    </div>
  );
};
