import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';  // Ensure you create this file for custom CSS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
