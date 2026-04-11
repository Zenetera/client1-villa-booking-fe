import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { HomePage } from './pages/public/HomePage/HomePage';
import { TermsPage } from './pages/public/TermsPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { BookingSuccessPage } from './pages/public/BookingSuccessPage';
import { BookingsListPage } from './pages/admin/BookingsListPage';
import { BlockedDatesPage } from './pages/admin/BlockedDatesPage';
import { VillaEditorPage } from './pages/admin/VillaEditorPage';
import { ImageManagerPage } from './pages/admin/ImageManagerPage';
import { ContactInfoPage } from './pages/admin/ContactInfoPage';
import { TermsEditorPage } from './pages/admin/TermsEditorPage';
import { PricingPage } from './pages/admin/PricingPage';
import { PrivacyEditorPage } from './pages/admin/PrivacyEditorPage';

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
      {
        path: 'booking-confirmation',
        element: <BookingSuccessPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <BookingsListPage />,
      },
      {
        path: 'calendar',
        element: <BlockedDatesPage />,
      },
      {
        path: 'villa',
        element: <VillaEditorPage />,
      },
      {
        path: 'pricing',
        element: <PricingPage />,
      },
      {
        path: 'images',
        element: <ImageManagerPage />,
      },
      {
        path: 'contact',
        element: <ContactInfoPage />,
      },
      {
        path: 'terms',
        element: <TermsEditorPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyEditorPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
