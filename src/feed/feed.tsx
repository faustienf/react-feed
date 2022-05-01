import React, {
    ComponentProps,
    FC,
    ReactNode,
    useCallback,
    useMemo,
    useRef,
    useState
} from 'react';

import { binarySearch } from './binary-search';
import { FeedItem } from './feed-item';

import './feed.css';

type Props = Omit<ComponentProps<'div'>, 'children'> & {
  threshold: number;
  children: (startIndex: number) => ReactNode[];
  onReadHeight?: (element: HTMLLIElement, index: number) => number;
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
  const rootRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLUListElement>(null);

  const startIndexRef = useRef(startIndex);
  startIndexRef.current = startIndex;

  const childrenRef = useRef(children);
  childrenRef.current = children;

  const onReadHeightRef = useRef(onReadHeight);
  onReadHeightRef.current = onReadHeight;

  const defineItemsHeight = useCallback(
    () => {
      const offsets = offsetsRef.current;
      const startOffset = offsets[startIndexRef.current];
      const lastOffset = offsets[offsets.length - 1];
      const itemsEl = itemsRef.current;
      if (itemsEl) {
        itemsEl.style.setProperty('padding-top', `${startOffset}px`);
        itemsEl.style.setProperty('min-height', `${lastOffset}px`);
      }
    },
    [],
  );

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

  const handleItemRender = useCallback(
    (itemElement: HTMLLIElement, index: number) => {
      queueMicrotask(() => {
        const clientHeight = onReadHeightRef.current(itemElement, index);
        calcOffsets(clientHeight, index);
      });
    },
    [calcOffsets],
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

  const style = useMemo(
    () => {
      const offsets = offsetsRef.current;
      return {
        paddingTop: `${offsets[startIndex]}px`,
        minHeight: `${offsets[offsets.length - 1]}px`
      };
    },
    [startIndex],
  );

  return (
    <div
      {...divProps}
      ref={rootRef}
      className={`feed ${className}`.trim()}
      onScroll={handleScroll}
    >
      <ul
        ref={itemsRef}
        style={style}
        className="feed-items"
      >
        {items.map((item, index) => (
          <FeedItem
            key={startIndex + index}
            index={startIndex + index}
            onRender={handleItemRender}
          >
            {item}
          </FeedItem>
        ))}
      </ul>
    </div>
  );
};
