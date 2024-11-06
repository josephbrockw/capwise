import AppRouter from './routes';
import { PrimeReactProvider } from 'primereact/api';
// client/src/index.js or client/src/App.js


function App() {
  return (
    <PrimeReactProvider>
      <AppRouter />
    </PrimeReactProvider>
  )
}

export default App;
