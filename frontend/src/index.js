import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';        // Import global styles
import App from './App';     // Import the main App component
import reportWebVitals from './reportWebVitals'; // Optional for performance tracking
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter for routing

// Get the root element where React will be rendered
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the root component inside BrowserRouter to enable routing
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// For performance tracking (optional)
reportWebVitals();