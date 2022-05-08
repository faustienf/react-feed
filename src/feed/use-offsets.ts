import { useCallback, useRef } from 'react';

export const useOffsets = () => {
  const offsets = useRef(new Map<number, number>()).current;

  const changeOffset = useCallback(
    (index: number, height: number) => {
      const previousOffset = offsets.get(index - 1) ?? 0;
      const currentOffset = offsets.get(index) ?? 0;
      const newCurrentOffset = index
        ? height + previousOffset
        : height;

      offsets.set(index, newCurrentOffset);

      // Redefine offsets by diff
      const diff = newCurrentOffset - currentOffset;
      if (diff !== 0) {
        for (
          let nextIndex = index + 1;
          nextIndex < offsets.size;
          nextIndex += 1
        ) {
          const nextOffset = offsets.get(nextIndex) ?? 0;
          offsets.set(nextIndex, nextOffset + diff);
        }
      }
    },
    [offsets],
  );

  return [offsets, changeOffset] as const;
};
