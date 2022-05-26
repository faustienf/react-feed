import React, { useMemo, useRef, useState } from 'react';

import { useFeed } from './feed';
import { Article } from './article';
import { ThresholdPx } from './threshold-px';
import { ThresholdItems } from './threshold-items';

import './app.css';

const items = Array(100000).fill(0).map((_, index) => ({
  id: index,
  height: 100 + Math.round(Math.random() * 150),
  height: 200,
}));

const THRESHOLD_PX = 300;
const THRESHOLD_ITEMS = 2;
const DISPLAY_ITEMS = 10;
const MARGIN_GAP = 16;

const limit = (target: number, min: number, max: number) => Math.min(Math.max(target, min), max);

export const App = () => {
  const [startIndex, setStartIndex] = useState(0);
  const itemsRef = useRef<HTMLDivElement>(null);

  const thresholdHeight = useMemo(
    () => items
      .slice(0, THRESHOLD_ITEMS)
      .reduce(
        (acc, item) => MARGIN_GAP + acc + item.height,
        0,
      ),
    [],
  );

  const onReadHeight = (itemEl: HTMLElement) => itemEl.offsetHeight + MARGIN_GAP;

  const onReadScrollTop = (itemsEl: HTMLElement) => {
    return Math.max(-1 * itemsEl.getBoundingClientRect().top, 0);
  };

  const onChangeStartIndex = (foundStartIndex: number) => {
    const nextStartIndex = foundStartIndex < 0
      ? startIndex
      : foundStartIndex - (THRESHOLD_ITEMS - 1);

    setStartIndex(limit(nextStartIndex, 0, items.length - 1));
  };

  const { style } = useFeed(itemsRef, {
    startIndex,
    onChangeStartIndex,
    onReadHeight,
    onReadScrollTop,
  });

  return (
    <section className="articles">
      <ThresholdPx
        style={{ height: THRESHOLD_PX - 48 }}
      />
      <ThresholdItems
        style={{ top: THRESHOLD_PX, height: thresholdHeight }}
      />

      <div
        ref={itemsRef}
        style={style}
      >
        {items.slice(startIndex, startIndex + DISPLAY_ITEMS).map((item) => (
          <Article
            key={item.id}
            style={{ height: item.height }}
          >
            {item.id}
          </Article>
        ))}
      </div>
    </section>
  );
};
