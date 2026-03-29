import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { HomePage } from './pages/public/HomePage/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
