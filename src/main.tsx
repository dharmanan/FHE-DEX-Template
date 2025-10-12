import { Buffer } from 'buffer';
// Polyfill: Ethers.js ve web3 için Buffer'ı window'a ekle
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.Buffer = Buffer;
}
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
