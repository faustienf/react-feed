import { useEffect, useRef } from 'react';

export const useRaf = <F extends () => void>(callback: F) => {
  const ref = useRef(callback);
  ref.current = callback;

  useEffect(
    () => {
      const tick = () => {
        requestAnimationFrame(tick);
        ref.current();
      };

      const requestId = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(requestId);
      };
    },
    [],
  );
};
