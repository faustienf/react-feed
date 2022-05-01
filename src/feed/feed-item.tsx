import React, {
  ComponentProps,
  FC,
  forwardRef,
  PropsWithChildren,
  useEffect,
  useRef,
} from 'react';

import './feed-item.css';

type Props = ComponentProps<'li'> & {
  index: number;
  onRender: (element: HTMLLIElement, index: number) => void;
}

export const FeedItem = forwardRef<HTMLLIElement, PropsWithChildren<Props>>((props, ref) => {
  const {
    children,
    index,
    onRender,
  } = props;

  const localRef = useRef<HTMLLIElement>(null);

  useEffect(
    () => {
      const element = ref && 'current' in ref 
        ? ref.current
        : localRef.current;

      if (!element) {
        return;
      }

      onRender(element, index);
    },
    [index, onRender, ref]
  );

  return (
    <li 
      ref={ref || localRef}
      data-index={index}
      className="feed-item"
    >
      {children}
    </li>
  );
});
