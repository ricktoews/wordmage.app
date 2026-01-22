// src/otel.js
import SessionRecorder from '@multiplayer-app/session-recorder-browser';

export function ensureOtelStarted({ userId, userName } = {}) {
  // Guard so we only init/start once per tab
  if (window.__OTEL_SESSION_STARTED__) return;

  SessionRecorder.init({
    application: 'my-web-app',
    version: '1.0.0',
    environment: 'production',
    apiKey: 'YOUR_REAL_OTLP_KEY',
    // propagateTraceHeaderCorsUrls: [new RegExp('https://api.example.com', 'i')],
  });

  if (userId || userName) {
    SessionRecorder.setSessionAttributes({ userId, userName });
  }

  SessionRecorder.start();
  window.__OTEL_SESSION_STARTED__ = true;

  // Clean up on HMR reloads (dev)
  if (typeof import.meta !== 'undefined' && import.meta.hot) {
    import.meta.hot.dispose(() => {
      try { SessionRecorder.stop('HMR dispose'); } catch {}
      window.__OTEL_SESSION_STARTED__ = false;
    });
  } else if (typeof module !== 'undefined' && module.hot) {
    module.hot.dispose(() => {
      try { SessionRecorder.stop('HMR dispose'); } catch {}
      window.__OTEL_SESSION_STARTED__ = false;
    });
  }
}

