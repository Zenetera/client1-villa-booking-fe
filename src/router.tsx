import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { HomePage } from './pages/public/HomePage/HomePage';
import { TermsPage } from './pages/public/TermsPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { LoginPage } from './pages/admin/LoginPage';
import { BookingsListPage } from './pages/admin/BookingsListPage';
import { BlockedDatesPage } from './pages/admin/BlockedDatesPage';
import { VillaEditorPage } from './pages/admin/VillaEditorPage';
import { ImageManagerPage } from './pages/admin/ImageManagerPage';
import { ContactInfoPage } from './pages/admin/ContactInfoPage';
import { TermsEditorPage } from './pages/admin/TermsEditorPage';
import { PrivacyEditorPage } from './pages/admin/PrivacyEditorPage';
import { ProtectedRoute, GuestOnlyRoute } from './components/auth/AuthGuards';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'terms',
        element: <TermsPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <BookingsListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'calendar',
        element: (
          <ProtectedRoute>
            <BlockedDatesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'villa',
        element: (
          <ProtectedRoute>
            <VillaEditorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'images',
        element: (
          <ProtectedRoute>
            <ImageManagerPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'contact',
        element: (
          <ProtectedRoute>
            <ContactInfoPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'terms',
        element: (
          <ProtectedRoute>
            <TermsEditorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'privacy',
        element: (
          <ProtectedRoute>
            <PrivacyEditorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <GuestOnlyRoute>
            <LoginPage />
          </GuestOnlyRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
