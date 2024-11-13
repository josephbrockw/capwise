import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'primereact/resources/themes/saga-blue/theme.css';  // Theme
import 'primereact/resources/primereact.min.css';          // Core CSS
import 'primeicons/primeicons.css';                        // Icons
import "primeflex/primeflex.css";                          // Grid system
import './App.css';
import config from './config';


// Dynamically inject theme variables into the :root selector
const applyTheme = (theme) => {
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
};


// Apply theme variables to the :root selector
applyTheme(config.theme);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
