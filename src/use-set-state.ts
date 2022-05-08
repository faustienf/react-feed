import { useState } from 'react';

export const useSetState = <T>() => {
  const [set, setState] = useState(new Set<T>());

  const onToggle = (value: T) => {
    setState((state) => {
      const nextState = new Set(state);
      if (nextState.has(value)) {
        nextState.delete(value);
      } else {
        nextState.add(value);
      }

      return nextState;
    });
  };

  return [
    set,
    onToggle,
  ] as const;
};
