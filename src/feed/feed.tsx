import React, {
    ComponentProps,
    FC,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from 'react';
import { useLayoutEffect } from 'react';
import { useMemo } from 'react';
import { feedContext } from './feed-context';
import { useResizeObserver } from './use-resize-observer';

type Props = ComponentProps<'div'> & {
  onReadHeight?: (element: HTMLElement, index: number) => number;
}

const defaultReadHeight: Props['onReadHeight'] = (element) => element.clientHeight;

const queueMacrotask = (fn: () => void, delayMs: number): () => void => {
  let timerId = setTimeout(fn, delayMs);
  return () => clearTimeout(timerId);
};

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

  const updateRootStyles = useCallback(
    () => {
      const items = itemsRef.current;
      if (!items) {
        return;
      }
      const lastOffset = getLastOffset();
      const minHeight = `${lastOffset}px`;
      if (items.style.minHeight !== minHeight) {
        items.style.minHeight = minHeight;
      }
    },
    [getLastOffset],
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
  });

  useEffect(
    () => {
      const itemsSlice = itemsSliceRef.current;
      if (!itemsSlice) {
        return () => {};
      }

      observer.observe(itemsSlice);
      const stopTask = queueMacrotask(() => {
        updateRootStyles();
      }, 100);

      return () => {
        observer.disconnect();
        stopTask();
      };
    },
    [observer, updateRootStyles],
  );

  useLayoutEffect(
    () => {
      const itemsSlice = itemsSliceRef.current;
      if (!itemsSlice) {
        return;
      }
      const prevOffset = offsets.get(startIndex - 1) || 0;
      itemsSlice.style.transform = `translateY(${prevOffset}px)`;
    },
    [offsets, startIndex],
  );

  useEffect(
    () => {
      const itemsSlice = itemsSliceRef.current;
      if (!itemsSlice) {
        return;
      }

      Array
        .from(itemsSlice.children)
        .forEach((node, index) => {
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
          updateOffset(node, indexOfList);
        });

      const stopTask = queueMacrotask(() => {
        updateRootStyles();
      }, 100);

      return () => {
        stopTask();
      };
    },
    [startIndex, updateOffset, updateRootStyles],
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
