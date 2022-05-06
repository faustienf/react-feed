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
    changeOffset,
    getLastOffset,
    getPrevOffset,
  } = useContext(feedContext);

  const itemsRef = useRef<HTMLDivElement>(null);
  const itemsSliceRef = useRef<HTMLDivElement>(null);
  const shownItems = useRef(new Set<number>());

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
      const minHeight = `${lastOffset}px`;
      if (items.style.minHeight !== minHeight) {
        items.style.minHeight = minHeight;
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

      let inited = false;
      const observer = new ResizeObserver(([entry]) => {
        if (!inited) {
          // skip initial call
          inited = true;
          return;
        }

        Array
          .from(entry.target.children)
          .forEach((node, index) => {
            if (!(node instanceof HTMLElement)) {
              return;
            }
            const indexOfList = startIndex + index;
            changeElementOffset(node, indexOfList);
          });

        updateHeight();
      });

      observer.observe(itemsSlice);
      return () => {
        observer.disconnect();
      };
    },
    [updateHeight, changeElementOffset, startIndex],
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
    },
    [startIndex, changeElementOffset, updateHeight],
  );

  const lastOffset = getLastOffset();
  const prevOffset = getPrevOffset();

  const rootStyle = useMemo(
    () => ({
      willChange: 'min-height',
      minHeight: `${lastOffset}px`,
    }),
    [lastOffset],
  );

  const sliceStyle = useMemo(
    () => ({
      willChange: 'transform',
      transform: `translateY(${prevOffset}px)`,
    }),
    [prevOffset],
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
