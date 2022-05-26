import React, { ComponentProps, FC } from 'react';

import './message.css';

type Props = ComponentProps<'div'>;

export const Message: FC<Props> = (props) => {
  return (
    <div
      {...props}
      className="message"
    />
  );
};
