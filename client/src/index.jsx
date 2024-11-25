import ReactDOM from 'react-dom/client';
import App from './App';
import { SettingsProvider } from './context';
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

// Set the document title dynamically
document.title = config.appName;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <SettingsProvider>
    <App />
  </SettingsProvider>
);
