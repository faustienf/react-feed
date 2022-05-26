import { useCallback, useRef } from 'react';

export const useOffsets = () => {
  const offsets = useRef<number[]>([]).current;

  const changeOffset = useCallback(
    (index: number, height: number) => {
      const previousOffset = offsets[index - 1] || 0;
      const currentOffset = offsets[index] || 0;
      const newCurrentOffset = index
        ? height + previousOffset
        : height;

      offsets[index] = newCurrentOffset;

      // Redefine offsets by diff
      const diff = newCurrentOffset - currentOffset;
      if (diff !== 0) {
        for (
          let nextIndex = index + 1;
          nextIndex < offsets.length;
          nextIndex += 1
        ) {
          const nextOffset = offsets[nextIndex] || 0;
          offsets[nextIndex] = nextOffset + diff;
        }
      }
    },
    [offsets],
  );

  return [offsets, changeOffset] as const;
};
