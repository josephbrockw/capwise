import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// client/src/index.js or client/src/App.js
import 'primereact/resources/themes/saga-blue/theme.css';  // Theme
import 'primereact/resources/primereact.min.css';          // Core CSS
import 'primeicons/primeicons.css';                        // Icons


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
