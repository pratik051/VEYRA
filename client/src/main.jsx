import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Suppress benign browser/DevTools COOP popup polling notices
if (typeof window !== 'undefined') {
  const isCoopNotice = (arg) => {
    if (!arg) return false;
    const str = typeof arg === 'string' ? arg : (arg.message || String(arg));
    return str.includes('Cross-Origin-Opener-Policy') || str.includes('window.closed');
  };

  const origWarn = console.warn;
  console.warn = function (...args) {
    if (args.some(isCoopNotice)) return;
    origWarn.apply(console, args);
  };

  const origError = console.error;
  console.error = function (...args) {
    if (args.some(isCoopNotice)) return;
    origError.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

