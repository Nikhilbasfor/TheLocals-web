import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Entry & Auth
import RoleSelectionPage from './pages/RoleSelectionPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Traveller Flow
import ExploreHomePage from './pages/traveller/ExploreHomePage';
import ExperienceDetailPage from './pages/traveller/ExperienceDetailPage';
import TravellerBookingsPage from './pages/traveller/TravellerBookingsPage';
import WishlistPage from './pages/traveller/WishlistPage';
import TravellerProfilePage from './pages/traveller/TravellerProfilePage';
import VerifiedGuidesPage from './pages/traveller/VerifiedGuidesPage';
import GuidePublicProfilePage from './pages/traveller/GuidePublicProfilePage';

// Guide Flow
import GuideOnboardingPage from './pages/guide/GuideOnboardingPage';
import GuideDashboardPage from './pages/guide/GuideDashboardPage';
import CreateEditExperiencePage from './pages/guide/CreateEditExperiencePage';
import GuideBookingsPage from './pages/guide/GuideBookingsPage';
import GuideProfilePage from './pages/guide/GuideProfilePage';

// Protected Route Guard for Guide
function GuideRoute({ children }) {
  const { currentUser, isGuide } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login?role=guide" replace />;
  }
  return children;
}

// Protected Route Guard for Traveller
function TravellerRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login?role=traveller" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Role Selection / Entry */}
      <Route path="/" element={<RoleSelectionPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Traveller Routes */}
      <Route path="/explore" element={<ExploreHomePage />} />
      <Route path="/experience/:id" element={<ExperienceDetailPage />} />
      <Route path="/guides" element={<VerifiedGuidesPage />} />
      <Route path="/guide-profile/:guideId" element={<GuidePublicProfilePage />} />
      <Route path="/bookings" element={<TravellerRoute><TravellerBookingsPage /></TravellerRoute>} />
      <Route path="/wishlist" element={<TravellerRoute><WishlistPage /></TravellerRoute>} />
      <Route path="/profile" element={<TravellerRoute><TravellerProfilePage /></TravellerRoute>} />

      {/* Guide Routes */}
      <Route path="/guide/onboarding" element={<GuideRoute><GuideOnboardingPage /></GuideRoute>} />
      <Route path="/guide/dashboard" element={<GuideRoute><GuideDashboardPage /></GuideRoute>} />
      <Route path="/guide/experiences" element={<GuideRoute><GuideDashboardPage /></GuideRoute>} />
      <Route path="/guide/create-experience" element={<GuideRoute><CreateEditExperiencePage /></GuideRoute>} />
      <Route path="/guide/edit-experience/:id" element={<GuideRoute><CreateEditExperiencePage /></GuideRoute>} />
      <Route path="/guide/bookings" element={<GuideRoute><GuideBookingsPage /></GuideRoute>} />
      <Route path="/guide/profile" element={<GuideRoute><GuideProfilePage /></GuideRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
