import React from 'react';
import './app.css';
import { Feed } from './feed';

const items = Array(10000).fill(0).map((_, index) => ({
  id: index,
}));

export const App = () => {
  return (
    <Feed
      threshold={2}
      className="articles"
      onReadHeight={(el) => el.clientHeight + 10}
    >
      {(startIndex) => items.slice(startIndex, startIndex + 14).map((item) => (
        <article 
          key={item.id}
          className="article"
        >
          {item.id}
        </article>
      ))}
    </Feed>
  );
};
