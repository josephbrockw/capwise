import './App.css';
import AppRouter from './routes';
import { PrimeReactProvider } from 'primereact/api';
// client/src/index.js or client/src/App.js
import 'primereact/resources/themes/saga-green/theme.css';  // Theme
import 'primereact/resources/primereact.min.css';          // Core CSS
import 'primeicons/primeicons.css';                        // Icons
import "primeflex/primeflex.css";                          // Grid system


function App() {
  return (
    <PrimeReactProvider>
      <AppRouter />
    </PrimeReactProvider>
  )
}

export default App;
