import React from 'react';

import { Feed, useFeed } from './feed';
import { useWindowEvent } from './use-window-event';
import { Article } from './article';

import './app.css';

const items = Array(100).fill(0).map((_, index) => ({
  id: index,
}));

export const App = () => {
  const {
    startIndex,
    handleScroll,
  } = useFeed({
    thresholdItems: 1,
    thresholdPx: 300,
  });

  useWindowEvent('scroll', handleScroll);

  return (
    <section className="articles">
      <Feed onReadHeight={(el) => el.offsetHeight + 10}>
        {items.slice(startIndex, startIndex + 8).map((item) => (
          <Article key={item.id}>
            {item.id}
          </Article>
        ))}
      </Feed>
    </section>
  );
};
