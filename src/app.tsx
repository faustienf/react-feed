import React from 'react';

import { Feed, useFeed } from './feed';
import { useWindowEvent } from './use-window-event';
import { Article } from './article';
import { ThresholdPx } from './threshold-px';
import { ThresholdItems } from './threshold-items';

import './app.css';

const items = Array(1000).fill(0).map((_, index) => ({
  id: index,
  height: 100 + Math.floor(Math.random() * 150),
}));

const THRESHOLD_PX = 300;
const THRESHOLD_ITEMS = 1;

export const App = () => {
  const {
    startIndex,
    offsets,
    handleScroll,
  } = useFeed({
    thresholdPx: THRESHOLD_PX,
    thresholdItems: THRESHOLD_ITEMS,
  });

  useWindowEvent('scroll', handleScroll);

  return (
    <section className="articles">
      <ThresholdPx
        style={{height: THRESHOLD_PX - 48}}
      />
      <ThresholdItems
        style={{top: THRESHOLD_PX, height: offsets.get(THRESHOLD_ITEMS - 1)}}
      />

      <Feed onReadHeight={(el) => el.offsetHeight + 16}>
        {items.slice(startIndex, startIndex + 8).map((item) => (
          <Article 
            key={item.id}
            style={{height: item.height}}
          >
            {item.id}
          </Article>
        ))}
      </Feed>
    </section>
  );
};
