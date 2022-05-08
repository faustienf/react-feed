import { useEffect } from "react";

export const useWindowEvent = <E extends string, L extends (e: Event) => void>(event: E, listener: L) => {
  useEffect(
    () => {
      window.addEventListener(event, listener, {capture: true});
      return () => {
        window.removeEventListener(event, listener, {capture: true});
      };
    },
    [event, listener],
  );
};
