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
    offsetsRef,
  } = useContext(feedContext);

  const itemsRef = useRef<HTMLDivElement>(null);
  const itemsSliceRef = useRef<HTMLDivElement>(null);

  const startIndexRef = useRef(startIndex);
  startIndexRef.current = startIndex;

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
    [offsetsRef],
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
           * Skip extra read height. 
           * Always read first element for avoid shaking.
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
    [calcOffsets, offsetsRef, startIndex],
  );

  const offsets = offsetsRef.current;

  return (
    <div
      style={{
        willChange: 'min-height',
        minHeight: offsets[offsets.length - 1],
      }}
      {...divProps}
      ref={itemsRef}
    >
      <div 
        ref={itemsSliceRef}
        style={{
          willChange: 'transform',
          position: 'relative', 
        }}  
      >
        {children}
      </div>
    </div>
  );
};
