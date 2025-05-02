import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectSubmitPage from './pages/ProjectSubmitPage';
import { useAuth } from './contexts/AuthContext';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

const routes = [
  {
    path: '/register',
    element: <RegisterPage />,
    public: true
  },
  {
    path: '/login',
    element: <LoginPage />,
    public: true
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: (
          <PrivateRoute
            allowedRoles={['admin', 'moderator', 'user']}
          >
            <DashboardPage />
          </PrivateRoute>
        )
      },
      {
        path: '/projects',
        element: (
          <PrivateRoute
            allowedRoles={['admin', 'moderator', 'user']}
          >
            <ProjectsPage />
          </PrivateRoute>
        )
      },
      {
        path: '/projects/:id',M
        element: (
          <PrivateRoute
            allowedRoles={['admin', 'moderator', 'user']}
          >
            <ProjectDetailPage />
          </PrivateRoute>
        )
      },
      {
        path: '/projects/submit',
        element: (
          <PrivateRoute
            allowedRoles={['admin', 'moderator']}
          >
            <ProjectSubmitPage />
          </PrivateRoute>
        )
      }
    ]
  }
];

export default routes;

