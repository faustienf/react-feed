import React, {
  ComponentProps,
  CSSProperties,
  FC,
  useRef,
  useMemo,
} from 'react';

import { binarySearch } from './binary-search';
import { useEvent } from './use-event';
import { useOffsets } from './use-offsets';
import { usePrevious } from './use-previous';
import { useRaf } from './use-raf';

type Props = ComponentProps<'div'> & {
  startIndex: number;
  onChangeStartIndex: (nextStartIndex: number) => void;
  onReadHeight: (element: HTMLElement, index: number) => number;
  onReadScrollTop: (element: HTMLElement) => number;
};

export const Feed: FC<Props> = (props) => {
  const {
    children,
    startIndex,
    onChangeStartIndex,
    onReadHeight,
    onReadScrollTop,
    ...divProps
  } = props;

  const [offsets, changeOffset] = useOffsets();
  const onPrevious = usePrevious(-1);
  const itemsRef = useRef<HTMLDivElement>(null);

  const changeElementOffset = useEvent((element: HTMLElement, index: number) => {
    const clientHeight = onReadHeight(element, index);
    changeOffset(index, clientHeight);
  });

  const onScroll = useEvent((scrollTop: number) => {
    const [, foundIndex] = binarySearch(offsets, (offset, index) => {
      const previousOffest = offsets.get(index - 1) || 0;
      const isFound = offset >= scrollTop && scrollTop > previousOffest;

      if (isFound) {
        return 0;
      }

      return scrollTop - offset;
    });

    const index = foundIndex < 0
      ? startIndex
      : foundIndex;

    const nextStartIndex = Math.max(index, 0);
    onChangeStartIndex(nextStartIndex);
  });

  useRaf(() => {
    const items = itemsRef.current;
    if (!items) {
      return;
    }

    Array.from(items.children).forEach((node, index) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      const indexOfList = startIndex + index;
      changeElementOffset(node, indexOfList);
    });

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

  return (
    <div
      {...divProps}
      style={style}
      ref={itemsRef}
    >
      {children}
    </div>
  );
};
