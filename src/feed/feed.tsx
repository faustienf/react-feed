import React, {
    ComponentProps,
    CSSProperties,
    FC,
    useRef,
} from 'react';
import { useMemo } from 'react';
import { binarySearch } from './binary-search';
import { useEvent } from './use-event';
import { useOffsets } from './use-offsets';
import { useRaf } from './use-raf';

type Props = ComponentProps<'div'> & {
  startIndex: number;
  onChangeStartIndex: (nextStartIndex: number) => void;
  thresholdPx?: number;
  thresholdItems?: number;
  onReadHeight?: (element: HTMLElement, index: number) => number;
}

const defaultReadHeight: Props['onReadHeight'] = (element) => element.clientHeight;

export const Feed: FC<Props> = (props) => {
  const {
    children,
    startIndex,
    onChangeStartIndex,
    thresholdPx = 0,
    thresholdItems = 1,
    onReadHeight = defaultReadHeight,
    ...divProps
  } = props;

  const [offsets, changeOffset] = useOffsets();
  const itemsRef = useRef<HTMLDivElement>(null);

  const changeElementOffset = useEvent((element: HTMLElement, index: number) => {
    const clientHeight = onReadHeight(element, index);
    changeOffset(index, clientHeight);
  });

  const onScroll = useEvent((scrollTop: number) => {
    const [, foundIndex] = binarySearch(offsets, (offset, index) => {
      const prevOffest = offsets.get(index - 1) || 0;
      const isFound = offset >= scrollTop && scrollTop > prevOffest;

      if (isFound) {
        return 0;
      }
      return scrollTop - offset;
    });

    const index = foundIndex < 0 
      ? startIndex
      : foundIndex;

    const nextStartIndex = Math.max(index - (thresholdItems - 1), 0);
    onChangeStartIndex(nextStartIndex);
  });

  const prevScrollTopRef = useRef(-1);

  useRaf(() => {
    const items = itemsRef.current;
    if (!items) {
      return;
    }

    Array
      .from(items.children)
      .forEach((node, index) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }

        const indexOfList = startIndex + index;
        changeElementOffset(node, indexOfList);
      });

    // FIX ME
    const target = document.documentElement;
    const {scrollTop} = target;

    const prevScrollTop = prevScrollTopRef.current;
    prevScrollTopRef.current = scrollTop;

    if (prevScrollTop !== scrollTop) {
      const relativeScrollTop = scrollTop - thresholdPx;
      onScroll(relativeScrollTop);
    }
  });

  const lastOffset = offsets.get(offsets.size - 1) || 0;
  const prevOffset = offsets.get(startIndex - 1) || 0;

  const style: CSSProperties = useMemo(
    () => ({
      willChange: 'min-height, padding-top',
      transform: 'translateZ(0)',
      boxSizing: 'border-box',
      minHeight: lastOffset,
      paddingTop: prevOffset,
    }),
    [lastOffset, prevOffset],
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
