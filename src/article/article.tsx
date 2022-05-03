import React, { ComponentProps, FC, useState } from "react";

import './article.css';

type Props = ComponentProps<'article'>;

export const Article: FC<Props> = (props) => {
  const [isCollapsed, setCollapsed] = useState(false);

  return (
    <article 
      {...props}
      className="article"
      data-collapsed={isCollapsed} 
      onClick={() => setCollapsed((state) => !state)} 
    />
  );
};
