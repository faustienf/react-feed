import React, { FC } from "react";

import './threshold-px.css';

type Props = {
  height: number;
};

export const ThresholdPx: FC<Props> = ({height}) => {
  return (
    <div 
      className="threshold-px"
      style={{height: height - 48}}  
    />
  );
};
