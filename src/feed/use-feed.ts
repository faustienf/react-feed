import { CSSProperties, RefObject, useMemo } from 'react';

import { binarySearch } from './binary-search';
import { useEvent } from './use-event';
import { useOffsets } from './use-offsets';
import { usePrevious } from './use-previous';
import { useRaf } from './use-raf';

type Options = {
  startIndex: number;
  endIndex: number;
  onChangeStartIndex: (nextStartIndex: number) => void;
  onReadHeight: (element: HTMLElement, index: number) => number;
  onReadScrollTop: (element: HTMLElement) => number;
}

export const useFeed = (ref: RefObject<HTMLElement>, options: Options) => {
  const {
    startIndex,
    endIndex,
    onChangeStartIndex,
    onReadHeight,
    onReadScrollTop,
  } = options;

  const [offsets, changeOffset] = useOffsets();
  const onPrevious = usePrevious(-1);

  const changeElementOffset = useEvent((element: HTMLElement, index: number) => {
    const clientHeight = onReadHeight(element, index);
    changeOffset(index, clientHeight);
  });

  const onScroll = useEvent((scrollTop: number) => {
    const [, foundIndex] = binarySearch(offsets, (offset, index) => {
      if (typeof offset !== 'number') {
        return 1;
      }

      const previousOffest = offsets[index - 1] || 0;
      const isFound = offset >= scrollTop && scrollTop >= previousOffest;

      if (isFound) {
        return 0;
      }

      return scrollTop - offset;
    });

    onChangeStartIndex(foundIndex);
  });

  useRaf(() => {
    const items = ref.current;
    if (!items) {
      return;
    }

    for (let index = 0; index < items.children.length; index += 1) {
      const node = items.children[index];
      if (node instanceof HTMLElement) {
        const indexOfList = startIndex + index;
        changeElementOffset(node, indexOfList);
      }
    }

    const scrollTop = onReadScrollTop(items);
    const previousScrollTop = onPrevious(scrollTop);

    if (previousScrollTop !== scrollTop) {
      onScroll(scrollTop);
    }
  });

  const previousOffset = offsets[startIndex - 1] || 0;
  const lastOffset = offsets[offsets.length - 1] || 0;
  const nextOffset = lastOffset - (offsets[endIndex] || lastOffset);

  const style: CSSProperties = useMemo(
    () => ({
      paddingTop: previousOffset,
      paddingBottom: nextOffset,
    }),
    [nextOffset, previousOffset],
  );

  return {
    style,
  };
};
