import React, {
    ComponentProps,
    FC,
    PropsWithChildren,
    useCallback,
    useMemo,
    useRef,
    useState
} from 'react';

import { binarySearch } from './binary-search';
import { usePassiveScroll } from './use-passive-scroll';
import { FeedItem } from './feed-item';

import './feed.css';

type Props = ComponentProps<'div'> & {
  displayRows: number; // how many rows you expect to see
}

export const Feed: FC<PropsWithChildren<Props>> = (props) => {
  const {
    children,
    displayRows,
    className = '',
    ...divProps
  } = props;

  const [startIndex, setStartIndex] = useState(0);
  const offsetsRef = useRef<number[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLUListElement>(null);
  
  const threshold = useMemo(
    () => Math.ceil((displayRows + 1) / 2),
    [displayRows],
  );

  const defineItemsHeight = useCallback(
    () => {
      const offsets = offsetsRef.current;
      const lastOffset = offsets[offsets.length - 1];
      const itemsEl = itemsRef.current;
      if (itemsEl) {
        itemsEl.style.setProperty('height', `${lastOffset}px`);
      }
    },
    [],
  );

  const calcOffsets = useCallback(
    (height: number, index: number) => {
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
    [],
  );

  const handleItemRender = useCallback(
    (itemElement: HTMLLIElement, index: number) => {
      const clientHeight = itemElement.clientHeight;

      const offset = calcOffsets(clientHeight, index);

      itemElement.style.visibility = '';
      itemElement.style.transform = `translateY(${offset - clientHeight}px)`;

      defineItemsHeight();
    },
    [calcOffsets, defineItemsHeight],
  );

  const allItems = useMemo(
    () => React.Children.toArray(children),
    [children],
  );

  const sliceItems = useMemo(
    () => allItems?.slice(startIndex, startIndex + displayRows + (threshold * 2)),
    [allItems, displayRows, startIndex, threshold],
  );

  const handleScroll = useCallback(
    (e: Event) => {
      const {
        scrollTop,
      } = e.target as Element;

      const offsets = offsetsRef.current;

      const [, foundIndex] = binarySearch(offsets, (offset, index) => {
        const prevOffest = offsets[index - 1] || 0;
        const isFound = offset > scrollTop && scrollTop >= prevOffest;

        if (isFound) {
          return 0;
        }
        return offset - scrollTop;
      });

      const nextStartIndex = Math.max(foundIndex - threshold, 0);
      setStartIndex(nextStartIndex);
    },
    [threshold],
  );

  usePassiveScroll(
    rootRef,
    handleScroll,
  );

  return (
    <div
      {...divProps}
      ref={rootRef}
      className={`feed ${className}`}
    >
      <ul
        ref={itemsRef}
        className="feed-items"
      >
        {sliceItems.map((item, index) => (
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
