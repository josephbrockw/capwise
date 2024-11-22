import AppRouter from './routes';
import { PrimeReactProvider } from 'primereact/api';
// client/src/index.jsx.js or client/src/App.jsx.js


function App() {
  return (
    <PrimeReactProvider>
      <AppRouter />
    </PrimeReactProvider>
  )
}

export default App;
