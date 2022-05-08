import React, { ComponentProps, FC } from 'react';

import './threshold-px.css';

type Props = ComponentProps<'div'>;

export const ThresholdPx: FC<Props> = (props) => (
  <div
    className="threshold-px"
    {...props}
  />
);
