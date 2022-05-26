import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route } from 'wouter';

import { App } from './app';
import { Chat } from './chat';

import './index.css';

const root = ReactDOM.createRoot(document.querySelector('#root')!);
root.render(
  <React.StrictMode>
    <div>
      <Route path="/chat">
        <Chat />
      </Route>
      <Route path="/">
        <App />
      </Route>
    </div>
  </React.StrictMode>,
);
