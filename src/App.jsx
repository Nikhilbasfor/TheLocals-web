import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Entry & Auth
import RoleSelectionPage from './pages/RoleSelectionPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Traveller Flow
import TravellerDashboardPage from './pages/traveller/TravellerDashboardPage';
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
import GuideExperiencesPage from './pages/guide/GuideExperiencesPage';
import CreateEditExperiencePage from './pages/guide/CreateEditExperiencePage';
import GuideBookingsPage from './pages/guide/GuideBookingsPage';
import GuideProfilePage from './pages/guide/GuideProfilePage';

// Protected Route Guard for Guide (Any Guide status, e.g. onboarding/verification review)
function GuideRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login?role=guide" replace />;
  }
  return children;
}

// Protected Route Guard for Approved Guides (Locked until admin approves)
function ApprovedGuideRoute({ children }) {
  const { currentUser, userProfile } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login?role=guide" replace />;
  }
  if (!userProfile?.verified) {
    return <Navigate to="/guide/onboarding" replace />;
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

      {/* Traveller Routes (Explore is primary homepage, dashboard redirects to explore) */}
      <Route path="/dashboard" element={<Navigate to="/explore" replace />} />
      <Route path="/explore" element={<ExploreHomePage />} />
      <Route path="/experience/:id" element={<ExperienceDetailPage />} />
      <Route path="/guides" element={<VerifiedGuidesPage />} />
      <Route path="/guide-profile/:guideId" element={<GuidePublicProfilePage />} />
      <Route path="/bookings" element={<TravellerRoute><TravellerBookingsPage /></TravellerRoute>} />
      <Route path="/wishlist" element={<TravellerRoute><WishlistPage /></TravellerRoute>} />
      <Route path="/profile" element={<TravellerRoute><TravellerProfilePage /></TravellerRoute>} />

      {/* Guide Routes (Locked until admin approval except onboarding/review page) */}
      <Route path="/guide/onboarding" element={<GuideRoute><GuideOnboardingPage /></GuideRoute>} />
      <Route path="/guide/dashboard" element={<ApprovedGuideRoute><GuideDashboardPage /></ApprovedGuideRoute>} />
      <Route path="/guide/experiences" element={<ApprovedGuideRoute><GuideExperiencesPage /></ApprovedGuideRoute>} />
      <Route path="/guide/create-experience" element={<ApprovedGuideRoute><CreateEditExperiencePage /></ApprovedGuideRoute>} />
      <Route path="/guide/edit-experience/:id" element={<ApprovedGuideRoute><CreateEditExperiencePage /></ApprovedGuideRoute>} />
      <Route path="/guide/bookings" element={<ApprovedGuideRoute><GuideBookingsPage /></ApprovedGuideRoute>} />
      <Route path="/guide/profile" element={<ApprovedGuideRoute><GuideProfilePage /></ApprovedGuideRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/explore" replace />} />
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
