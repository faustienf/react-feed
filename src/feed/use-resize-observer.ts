import { useRef } from "react";

export const useResizeObserver = (callback: ResizeObserverCallback): ResizeObserver => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const observerRef = useRef(new ResizeObserver((...args) => {
    callbackRef.current(...args);
  }));

  return observerRef.current;
};
