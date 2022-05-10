import React, {
  ComponentProps,
  FC,
  useRef,
} from 'react';
import { useFeed } from './use-feed';

type Props = ComponentProps<'div'> & Parameters<typeof useFeed>[1];

export const Feed: FC<Props> = (props) => {
  const {
    children,
    startIndex,
    onChangeStartIndex,
    onReadHeight,
    onReadScrollTop,
    ...divProps
  } = props;

  const itemsRef = useRef<HTMLDivElement>(null);
  const { style } = useFeed(itemsRef, {
    startIndex,
    onChangeStartIndex,
    onReadHeight,
    onReadScrollTop,
  });

  return (
    <div
      {...divProps}
      style={style}
      ref={itemsRef}
    >
      {children}
    </div>
  );
};
