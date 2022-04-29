import { useEffect, RefObject } from "react";

export const usePassiveScroll = (
  ref: RefObject<HTMLElement>,
  handler: (event: Event) => void
): void => {
  useEffect(
    () => {
      const element = ref.current;

      if (!element) {
        return () => {};
      }

      element.addEventListener('scroll', handler, {passive: true});
      return () => {
        element.removeEventListener('scroll', handler);
      };
    },
    [ref, handler],
  );
};
