import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { probeBackend } from './services/api';

// Decide once, before anything renders, whether a Java backend is reachable.
// If it is not, the app runs on the in-browser backend (see services/demoBackend.ts).
probeBackend().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
