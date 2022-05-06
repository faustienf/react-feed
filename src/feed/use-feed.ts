import { useCallback, useContext, useTransition } from "react";

import { feedContext } from "./feed-context";
import { binarySearch } from "./binary-search";

type Options = {
  thresholdItems: number;
  thresholdPx: number;
}

const defaultOptions: Options = {
  thresholdItems: 1,
  thresholdPx: 0
};

export const useFeed = (options = defaultOptions) => {
  const {
    thresholdItems = defaultOptions.thresholdItems,
    thresholdPx = defaultOptions.thresholdPx
  } = options;

  const {
    startIndex,
    setStartIndex,
    offsets,
  } = useContext(feedContext);

  const [, startTransition] = useTransition();

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLElement> | Event) => {
      const target =  e.target instanceof HTMLElement 
        ? e.target
        : document.documentElement;

      const {scrollTop} = target;
      const relativeScrollTop = scrollTop - thresholdPx;

      queueMicrotask(() => {
        const [, foundIndex] = binarySearch(offsets, (offset, index) => {
          const prevOffest = offsets.get(index - 1) || 0;
          const isFound = offset >= relativeScrollTop && relativeScrollTop > prevOffest;
  
          if (isFound) {
            return 0;
          }
          return relativeScrollTop - offset;
        });

        const nextStartIndex = Math.max(foundIndex - (thresholdItems - 1), 0);
        startTransition(() => {
          setStartIndex(nextStartIndex);
        });
      });
    },
    [thresholdPx, offsets, thresholdItems, setStartIndex],
  );

  return {
    offsets,
    startIndex,
    setStartIndex,
    handleScroll
  };
};
