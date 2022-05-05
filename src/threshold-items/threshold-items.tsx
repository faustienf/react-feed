import React, { ComponentProps, FC } from "react";

import './threshold-items.css';

type Props = ComponentProps<'div'>;

export const ThresholdItems: FC<Props> = (props) => {
  return (
    <div 
      className="threshold-items"
      {...props}
    />
  );
};
