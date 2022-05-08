import { useCallback, useRef } from "react";

export const usePrevious = <V extends any>(initialValue: V) => {
  const ref = useRef(initialValue);

  return useCallback(
    (nextValue: V) => {
      const prevValue = ref.current;
      ref.current = nextValue;
      return prevValue;
    },
    [],
  );
};
