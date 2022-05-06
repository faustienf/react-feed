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

const DELAY_MACROTASK_HEIGHT = 0;

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
    changeOffset,
    getLastOffset,
  } = useContext(feedContext);

  const itemsRef = useRef<HTMLDivElement>(null);
  const itemsSliceRef = useRef<HTMLDivElement>(null);
  const shownItems = useRef(new Set<number>());

  const itemsHeightRef = useRef(getLastOffset());

  const startIndexRef = useRef(startIndex);
  startIndexRef.current = startIndex;

  const onReadHeightRef = useRef(onReadHeight);
  onReadHeightRef.current = onReadHeight;

  const changeElementOffset = useCallback(
    (element: HTMLElement, index: number) => {
      const clientHeight = onReadHeightRef.current(element, index);
      changeOffset(index, clientHeight);
      shownItems.current.add(index);
    },
    [changeOffset],
  );

  const updateHeight = useCallback(
    () => {
      const items = itemsRef.current;
      if (!items) {
        return;
      }
      const lastOffset = getLastOffset();
      if (itemsHeightRef.current !== lastOffset) {
        const minHeight = `${lastOffset}px`;
        items.style.minHeight = minHeight;
        itemsHeightRef.current = lastOffset;
      }
    },
    [getLastOffset],
  );

  useEffect(
    () => {
      const itemsSlice = itemsSliceRef.current;
      if (!itemsSlice) {
        return () => {};
      }

      const observer = new ResizeObserver(([entry]) => {
        Array
          .from(entry.target.children)
          .forEach((node, index) => {
            if (!(node instanceof HTMLElement)) {
              return;
            }
            const indexOfList = startIndexRef.current + index;
            changeElementOffset(node, indexOfList);
          });
      });

      observer.observe(itemsSlice);
      const stopTask = queueMacrotask(() => {
        updateHeight();
      }, DELAY_MACROTASK_HEIGHT);

      return () => {
        observer.disconnect();
        stopTask();
      };
    },
    [updateHeight, changeElementOffset],
  );

  /**
   * Recalculate offsets, update root height
   */
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
            // Skip extra read height
            return;
          }
          changeElementOffset(node, indexOfList);
        });

      const stopTask = queueMacrotask(() => {
        updateHeight();
      }, DELAY_MACROTASK_HEIGHT);

      return () => {
        stopTask();
      };
    },
    [startIndex, changeElementOffset, updateHeight],
  );

  const rootStyle = useMemo(
    () => ({
      willChange: 'min-height',
      minHeight: itemsHeightRef.current,
    }),
    [],
  );

  const sliceStyle = useMemo(
    () => {
      const prevOffset = offsets.get(startIndex - 1) || 0;
      return {
        willChange: 'transform',
        transform: `translateY(${prevOffset}px)`,
      };
    },
    [offsets, startIndex],
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
