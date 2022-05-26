import React, { useEffect, useRef, useState } from 'react';

import { Message } from './message';

import './chat.css';
import { useFeed } from '../feed';

const THRESHOLD_ITEMS = 2;
const DISPLAY_ITEMS = 10;

const initialMessages = Array(300).fill(0).map((_, index) => ({
  id: index,
  height: 100 + Math.round(Math.random() * 150),
}));

const limit = (target: number, min: number, max: number) => Math.min(Math.max(target, min), max);

export const Chat = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [startIndex, setStartIndex] = useState(initialMessages.length - DISPLAY_ITEMS);
  const messagesRef = useRef(null);

  const onReadHeight = (itemEl: HTMLElement) => itemEl.offsetHeight + 16;

  const onReadScrollTop = (itemsEl: HTMLElement) => {
    const offsetTop = itemsEl.parentElement?.offsetTop || 0;
    const relativeTop = itemsEl.getBoundingClientRect().top - offsetTop;
    return Math.max(-1 * relativeTop, 0);
  };

  const onChangeStartIndex = (foundStartIndex: number) => {
    const nextStartIndex = foundStartIndex < 0
      ? startIndex
      : foundStartIndex - THRESHOLD_ITEMS;

    setStartIndex(limit(nextStartIndex, 0, messages.length - 1));
  };

  const endIndex = Math.min(startIndex + DISPLAY_ITEMS - 1, messages.length - 1);

  const { style } = useFeed(messagesRef, {
    startIndex,
    endIndex,
    onChangeStartIndex,
    onReadHeight,
    onReadScrollTop,
  });

  useEffect(
    () => {
      const timerId = setInterval(() => {
        setMessages((state) => [...state, {
          id: state.length,
          height: 100 + Math.round(Math.random() * 150),
        }]);
      }, 1000);

      return () => clearInterval(timerId);
    },
    [],
  );

  return (
    <div className="chat">
      <div
        ref={messagesRef}
        style={style}
        className="chat-messages"
      >
        {messages.slice(startIndex, startIndex + DISPLAY_ITEMS).map((message) => (
          <Message
            key={message.id}
            style={{ height: message.height }}
          >
            {message.id}
          </Message>
        ))}
      </div>
    </div>
  );
};
