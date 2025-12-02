import { ToastProvider, ToastContainer } from './components/ui/Toast';
import AppRouter from './routes';

function App() {
  return (
    <ToastProvider>
      <AppRouter />
      <ToastContainer />
    </ToastProvider>
  )
}

export default App;
