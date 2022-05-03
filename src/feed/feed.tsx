import React, {
    ComponentProps,
    FC,
    useContext,
    useEffect,
    useRef,
} from 'react';
import { feedContext } from './feed-context';

type Props = ComponentProps<'div'> & {
  onReadHeight?: (element: HTMLElement, index: number) => number;
}

const defaultReadHeight: Props['onReadHeight'] = (element) => element.clientHeight;
const getLastOffset = (offsets: Map<number, number>): number => offsets.get(offsets.size - 1) || 0;
const getPrevOffset = (offsets: Map<number, number>, index: number): number => offsets.get(index - 1) || 0;

export const Feed: FC<Props> = (props) => {
  const {
    children,
    onReadHeight = defaultReadHeight,
    ...divProps
  } = props;

  const {
    startIndex,
    offsets,
    setOffset,
  } = useContext(feedContext);

  const itemsRef = useRef<HTMLDivElement>(null);
  const itemsSliceRef = useRef<HTMLDivElement>(null);

  const startIndexRef = useRef(startIndex);
  startIndexRef.current = startIndex;

  const onReadHeightRef = useRef(onReadHeight);
  onReadHeightRef.current = onReadHeight;

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
            setOffset(clientHeight, indexOfList);
          });

          queueMicrotask(() => {
            const lastOffset = getLastOffset(offsets);
            const prevOffset = getPrevOffset(offsets, startIndex);
            items.style.minHeight = `${lastOffset}px`;
            itemsSlice.style.transform = `translateY(${prevOffset}px)`;
          });
      });

      resizeObserver.observe(itemsSlice);

      return () => {
        resizeObserver.disconnect();
      }
    },
    [setOffset, offsets, startIndex],
  );

  const lastOffset = getLastOffset(offsets);
  const prevOffset = getPrevOffset(offsets, startIndex);

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
