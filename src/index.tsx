import React from 'react';
import ReactDOM from 'react-dom/client';
import {App} from './app';
import { FeedProvider } from './feed';

import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <FeedProvider>
      <App />
    </FeedProvider>
  </React.StrictMode>
);
