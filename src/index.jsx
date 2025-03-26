import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css'; // Make sure this file includes Tailwind imports
import App from './App'; // Using the simplified app that only includes Paper Management

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);