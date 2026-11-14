import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Pass a function to log results (e.g. reportWebVitals(console.log))
// or send to an analytics endpoint: https://bit.ly/CRA-vitals
reportWebVitals();

// Auto-reload on service worker updates (never on first-visit claim or active scrolling/typing)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  let refreshing = false;
  let pendingRefresh = false;
  let hadController = Boolean(navigator.serviceWorker.controller);
  let lastInteractionAt = 0;

  const markInteraction = () => {
    lastInteractionAt = Date.now();
  };

  for (const eventName of ['scroll', 'pointerdown', 'touchstart', 'keydown'] as const) {
    window.addEventListener(eventName, markInteraction, { passive: true });
  }

  const isUserActivelyInteracting = () => {
    const activeTag = document.activeElement?.tagName;
    const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';
    return isTyping || window.scrollY > 120 || Date.now() - lastInteractionAt < 4000;
  };

  const triggerReload = () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  };

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) {
      hadController = true;
      return;
    }
    if (isUserActivelyInteracting()) {
      pendingRefresh = true;
      return;
    }
    triggerReload();
  });

  const checkForUpdates = () => {
    navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.update().catch(() => {});
    });
  };

  // Apply deferred updates when idle upon returning; otherwise check for updates
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (pendingRefresh && !isUserActivelyInteracting()) {
        triggerReload();
        return;
      }
      checkForUpdates();
    }
  });

  window.addEventListener('popstate', () => {
    if (pendingRefresh) {
      triggerReload();
    }
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      checkForUpdates();
    }
  });
}

