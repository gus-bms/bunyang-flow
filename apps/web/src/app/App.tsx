import { Routes, Route, Outlet } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { MapShell } from "../components/layout/MapShell";
import { HomePage } from "../pages/HomePage";
import { OfferingsListPage } from "../pages/OfferingsListPage";
import { OfferingsMapPage } from "../pages/OfferingsMapPage";
import { OfferingDetailPage } from "../pages/OfferingDetailPage";
import { EligibilityPage } from "../pages/EligibilityPage";
import { ScorePage } from "../pages/ScorePage";
import { SavedPage } from "../pages/SavedPage";
import { SchedulePage } from "../pages/SchedulePage";
import { ProfilePage } from "../pages/ProfilePage";
import { OnboardingPage } from "../pages/OnboardingPage";
import { ComparisonPage } from "../pages/ComparisonPage";
import { AlertsPage } from "../pages/AlertsPage";
import { LoginPage } from "../pages/LoginPage";
import { KakaoCallbackPage } from "../pages/KakaoCallbackPage";

function StandardLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function MapLayout() {
  return (
    <MapShell>
      <Outlet />
    </MapShell>
  );
}

export function App() {
  return (
    <Routes>
      {/* Full-viewport map layout */}
      <Route element={<MapLayout />}>
        <Route path="/offerings/map" element={<OfferingsMapPage />} />
      </Route>

      {/* Standard scrollable layout */}
      <Route element={<StandardLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/offerings" element={<OfferingsListPage />} />
        <Route path="/offerings/:id" element={<OfferingDetailPage />} />
        <Route path="/eligibility" element={<EligibilityPage />} />
        <Route path="/score" element={<ScorePage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/me" element={<ProfilePage />} />
        <Route path="/compare" element={<ComparisonPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<KakaoCallbackPage />} />
      </Route>
    </Routes>
  );
}
