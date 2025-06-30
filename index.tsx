import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Guard against SSR or other non-browser environments where `document` is not defined.
// The app will only try to render on the client-side.
if (typeof document !== 'undefined') {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
