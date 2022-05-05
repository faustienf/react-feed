import React from 'react';

import { Feed, useFeed } from './feed';
import { useWindowEvent } from './use-window-event';
import { Article } from './article';
import { ThresholdPx } from './threshold-px';

import './app.css';

const items = Array(100).fill(0).map((_, index) => ({
  id: index,
}));

const THRESHOLD_PX = 300;

export const App = () => {
  const {
    startIndex,
    handleScroll,
  } = useFeed({
    thresholdItems: 2,
    thresholdPx: THRESHOLD_PX,
  });

  useWindowEvent('scroll', handleScroll);

  return (
    <section className="articles">
      <ThresholdPx height={THRESHOLD_PX} />

      <Feed onReadHeight={(el) => el.offsetHeight + 16}>
        {items.slice(startIndex, startIndex + 8).map((item) => (
          <Article key={item.id}>
            {item.id}
          </Article>
        ))}
      </Feed>
    </section>
  );
};
