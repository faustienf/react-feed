import React, { ComponentProps, FC } from "react";

import './article.css';

type Props = ComponentProps<'article'>;

export const Article: FC<Props> = (props) => {
  return (
    <article 
      {...props}
      className="article"
    />
  );
};
