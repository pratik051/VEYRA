import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Suppress benign browser/DevTools COOP popup polling notices
if (typeof window !== 'undefined') {
  const origWarn = console.warn;
  console.warn = function (...args) {
    if (
      args.length > 0 &&
      typeof args[0] === 'string' &&
      args[0].includes('Cross-Origin-Opener-Policy')
    ) {
      return;
    }
    origWarn.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

