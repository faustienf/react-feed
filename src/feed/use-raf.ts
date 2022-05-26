import { useEffect, useRef } from 'react';

export const useRaf = <F extends () => void>(callback: F) => {
  const ref = useRef(callback);
  ref.current = callback;

  useEffect(
    () => {
      ref.current();
      let requestId = NaN;

      const tick = () => {
        requestId = requestAnimationFrame(tick);
        ref.current();
      };

      requestId = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(requestId);
      };
    },
    [],
  );
};
