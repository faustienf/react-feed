import React, {
    ComponentProps,
    FC,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from 'react';
import { useMemo } from 'react';
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
  const shownItems = useRef(new Set<number>());

  const onReadHeightRef = useRef(onReadHeight);
  onReadHeightRef.current = onReadHeight;

  const updateOffset = useCallback(
    (element: HTMLElement, index: number) => {
      const clientHeight = onReadHeightRef.current(element, index);
      setOffset(index, clientHeight);
      shownItems.current.add(index);
    },
    [setOffset],
  );

  const updateStyles = useCallback(
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
      .forEach(async (node, index) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }
        const indexOfList = startIndex + index;
        updateOffset(node, indexOfList);
      });

    queueMicrotask(() => {
      updateStyles();
    });
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
        .forEach(async (node, index) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }
          const indexOfList = startIndex + index;
          if (shownItems.current.has(indexOfList)) {
            /**
             * Skip extra read height. 
             */
            return;
          }
          queueMicrotask(() => {
            updateOffset(node, indexOfList);
          });
        });

        updateStyles();
    },
    [setOffset, offsets, startIndex, observer, updateStyles, updateOffset],
  );

  const rootStyle = useMemo(
    () => ({
      willChange: 'min-height',
      minHeight: getLastOffset(),
    }),
    [getLastOffset],
  );

  const sliceStyle = useMemo(
    () => ({
      willChange: 'transform',
      transform: `translateY(${getPrevOffset()}px)`,
    }),
    [getPrevOffset],
  );

  return (
    <div
      style={rootStyle}
      {...divProps}
      ref={itemsRef}
    >
      <div 
        ref={itemsSliceRef}
        style={sliceStyle}  
      >
        {children}
      </div>
    </div>
  );
};
