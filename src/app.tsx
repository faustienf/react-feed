import React from 'react';
import './app.css';
import { Feed } from './feed';

const items = Array(10000).fill(0).map((_, index) => ({
  id: index,
}));

export const App = () => {
  return (
    <Feed
      displayRows={10}
      className="articles"
    >
      {(startIndex) => items.slice(startIndex, startIndex + 16).map((item) => (
        <article 
          key={item.id}
          className="article"
        />
      ))}
    </Feed>
  );
}
