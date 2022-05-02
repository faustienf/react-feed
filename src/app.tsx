import React from 'react';

import { Feed, useFeed } from './feed';
import { useWindowEvent } from './use-window-event';

import './app.css';

const items = Array(10000).fill(0).map((_, index) => ({
  id: index,
}));

export const App = () => {
  const {
    startIndex,
    handleScroll,
  } = useFeed({
    thresholdItems: 2,
    thresholdPx: 300,
  });

  useWindowEvent('scroll', handleScroll);

  return (
    <section className="articles">
      <Feed onReadHeight={(el) => el.offsetHeight + 10}>
        {items.slice(startIndex, startIndex + 8).map((item) => (
          <article 
            key={item.id}
            className="article"
          >
            {item.id}
          </article>
        ))}
      </Feed>
    </section>
  );
};
