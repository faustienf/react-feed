import { CSSProperties, RefObject, useMemo } from 'react';

import { binarySearch } from './binary-search';
import { useEvent } from './use-event';
import { useOffsets } from './use-offsets';
import { usePrevious } from './use-previous';
import { useRaf } from './use-raf';

type Options = {
  startIndex: number;
  onChangeStartIndex: (nextStartIndex: number) => void;
  onReadHeight: (element: HTMLElement, index: number) => number;
  onReadScrollTop: (element: HTMLElement) => number;
}

export const useFeed = (ref: RefObject<HTMLElement>, options: Options) => {
  const {
    startIndex,
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
      const previousOffest = offsets.get(index - 1) || 0;
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

  const lastOffset = offsets.get(offsets.size - 1) || 0;
  const previousOffset = offsets.get(startIndex - 1) || 0;

  const style: CSSProperties = useMemo(
    () => ({
      willChange: 'min-height, padding-top',
      transform: 'translateZ(0)',
      boxSizing: 'border-box',
      minHeight: lastOffset,
      paddingTop: previousOffset,
    }),
    [lastOffset, previousOffset],
  );

  return {
    style,
  };
};
