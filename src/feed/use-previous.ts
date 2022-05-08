import { useCallback, useRef } from 'react';

export const usePrevious = <V>(initialValue: V) => {
  const ref = useRef(initialValue);

  return useCallback(
    (nextValue: V) => {
      const previousValue = ref.current;
      ref.current = nextValue;
      return previousValue;
    },
    [],
  );
};
