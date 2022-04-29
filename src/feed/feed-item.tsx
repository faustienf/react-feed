import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useRef,
} from 'react';

import './feed-item.css';

type Props = {
  index: number;
  onRender: (element: HTMLLIElement, index: number) => void;
}

export const FeedItem: FC<PropsWithChildren<Props>> = (props) => {
  const {
    children,
    index,
    onRender,
  } = props;

  const ref = useRef<HTMLLIElement>(null);

  useEffect(
    () => {
      const element = ref.current;
      if (!element) return;

      onRender(element, index);
    },
  );

  return (
    <li 
      ref={ref}
      className="feed-item"
      style={{visibility: 'hidden'}}  
    >
      {children}
    </li>
  );
};
