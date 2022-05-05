import React, {
    ComponentProps,
    FC,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from 'react';
import { feedContext } from './feed-context';
import { useResizeObserver } from './use-resize-observer';

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
    setOffset,
    getLastOffset,
    getPrevOffset,
  } = useContext(feedContext);

  const itemsRef = useRef<HTMLDivElement>(null);
  const itemsSliceRef = useRef<HTMLDivElement>(null);

  const onReadHeightRef = useRef(onReadHeight);
  onReadHeightRef.current = onReadHeight;

  const updateOffset = useCallback(
    (element: HTMLElement, indexOfList: number) => {
      element.dataset.index = String(indexOfList);
      const clientHeight = onReadHeightRef.current(element, indexOfList);
      setOffset(indexOfList, clientHeight);
    },
    [setOffset],
  );

  const updateFeedHeight = useCallback(
    () => {
      const items = itemsRef.current;
      const itemsSlice = itemsSliceRef.current;
      if (!items || !itemsSlice) {
        return;
      }
      
      const lastOffset = getLastOffset();
      const prevOffset = getPrevOffset();
      const minHeight = `${lastOffset}px`;
      if (items.style.minHeight !== minHeight) {
        items.style.minHeight = minHeight;
      }
      itemsSlice.style.transform = `translateY(${prevOffset}px)`;
    },
    [getLastOffset, getPrevOffset],
  );

  const observer = useResizeObserver(([entry]) => {
    Array
      .from(entry.target.children)
      .forEach((node, index) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }
        const indexOfList = startIndex + index;
        updateOffset(node, indexOfList);
      });

    updateFeedHeight();
  });

  useEffect(
    () => {
      const itemsSlice = itemsSliceRef.current;
      if (!itemsSlice) {
        return () => {};
      }
      observer.observe(itemsSlice);
      return () => observer.disconnect();
    },
    [observer],
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
        .forEach((node, index) => {
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
          updateOffset(node, indexOfList);
        });

        updateFeedHeight();
    },
    [setOffset, offsets, startIndex, observer, updateFeedHeight, updateOffset],
  );

  const lastOffset = getLastOffset();
  const prevOffset = getPrevOffset();

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
