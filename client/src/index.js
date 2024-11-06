import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'primereact/resources/themes/saga-blue/theme.css';  // Theme
import 'primereact/resources/primereact.min.css';          // Core CSS
import 'primeicons/primeicons.css';                        // Icons
import "primeflex/primeflex.css";                          // Grid system
import './App.css';
import './pages/Dashboard/Dashboard.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
