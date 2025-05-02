import { BrowserRouter, useRoutes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import routes from './routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouterContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

function RouterContent() {
  const element = useRoutes(routes);
  return element;
}

export default App;