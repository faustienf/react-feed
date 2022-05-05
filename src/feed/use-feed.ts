import { useCallback, useContext } from "react";

import { feedContext } from "./feed-context";
import { binarySearch } from "./binary-search";

type Options = {
  thresholdItems: number;
  thresholdPx: number;
}

const defaultOptions: Options = {
  thresholdItems: 0,
  thresholdPx: 0
};

export const useFeed = ({thresholdItems, thresholdPx} = defaultOptions) => {
  const {
    startIndex,
    setStartIndex,
    offsets,
  } = useContext(feedContext);

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
        setStartIndex(nextStartIndex);
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
