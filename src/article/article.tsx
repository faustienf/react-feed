import React, { ComponentProps, FC } from 'react';

import './article.css';

type Props = ComponentProps<'article'>;

export const Article: FC<Props> = (props) => (
  <article
    {...props}
    className="article"
  />
);
