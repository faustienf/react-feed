import React, { useMemo, useState } from 'react';

import { Feed } from './feed';
import { Article } from './article';
import { ThresholdPx } from './threshold-px';
import { ThresholdItems } from './threshold-items';
import { useSetState } from './use-set-state';

import './app.css';

const items = Array(100000).fill(0).map((_, index) => ({
  id: index,
  height: 100 + Math.round(Math.random() * 150),
}));

const THRESHOLD_PX = 300;
const THRESHOLD_ITEMS = 2;
const DISPLAY_ITEMS = 10;
const MARGIN_GAP = 16;

export const App = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [collapsed, onToggle] = useSetState<number>();

  const thresholdHeight = useMemo(
    () => items
      .slice(0, THRESHOLD_ITEMS)
      .reduce(
        (acc, item) => (collapsed.has(item.id)
          ? MARGIN_GAP + acc + item.height * 2
          : MARGIN_GAP + acc + item.height),
        0,
      ),
    [collapsed],
  );

  const onReadHeight = (itemEl: HTMLElement) => itemEl.offsetHeight + MARGIN_GAP;

  const onReadScrollTop = (itemsEl: HTMLElement) => {
    return Math.max(-1 * itemsEl.getBoundingClientRect().top, 0);
  };

  const onChangeStartIndex = (nextStartIndex: number) => {
    setStartIndex(Math.max(nextStartIndex - (THRESHOLD_ITEMS - 1), 0));
  };

  return (
    <section className="articles">
      <ThresholdPx
        style={{ height: THRESHOLD_PX - 48 }}
      />
      <ThresholdItems
        style={{ top: THRESHOLD_PX, height: thresholdHeight }}
      />

      <Feed
        startIndex={startIndex}
        onReadHeight={onReadHeight}
        onReadScrollTop={onReadScrollTop}
        onChangeStartIndex={onChangeStartIndex}
      >
        {items.slice(startIndex, startIndex + DISPLAY_ITEMS).map((item) => (
          <Article
            key={item.id}
            style={{
              height: collapsed.has(item.id)
                ? item.height * 2
                : item.height,
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
