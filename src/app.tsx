import React, { useMemo } from 'react';

import { Feed, useFeed } from './feed';
import { useWindowEvent } from './use-window-event';
import { Article } from './article';
import { ThresholdPx } from './threshold-px';
import { ThresholdItems } from './threshold-items';

import './app.css';
import { useSetState } from './use-set-state';

const items = Array(1000).fill(0).map((_, index) => ({
  id: index,
  height: 100 + Math.round(Math.random() * 150),
}));

const THRESHOLD_PX = 300;
const THRESHOLD_ITEMS = 2;
const MARGIN_GAP = 16;

export const App = () => {
  const {
    startIndex,
    handleScroll,
  } = useFeed({
    thresholdPx: THRESHOLD_PX,
    thresholdItems: THRESHOLD_ITEMS,
  });

  useWindowEvent('scroll', handleScroll);

  const [collapsed, onToggle] = useSetState<number>();

  const thresholdHeight = useMemo(
    () => items
      .slice(0, THRESHOLD_ITEMS)
      .reduce(
        (acc, item) => collapsed.has(item.id)
          ? MARGIN_GAP + acc + item.height * 2
          : MARGIN_GAP + acc + item.height, 
        0),
    [collapsed],
  );

  return (
    <section className="articles">
      <ThresholdPx
        style={{height: THRESHOLD_PX - 48}}
      />
      <ThresholdItems
        style={{top: THRESHOLD_PX, height: thresholdHeight}}
      />

      <Feed onReadHeight={(el) => el.offsetHeight + MARGIN_GAP}>
        {items.slice(startIndex, startIndex + 10).map((item) => (
          <Article 
            key={item.id}
            style={{height: collapsed.has(item.id) 
              ? item.height * 2
              : item.height
            }}
            onClick={() => onToggle(item.id)}
          >
            {item.id}
          </Article>
        ))}
      </Feed>
    </section>
  );
};
