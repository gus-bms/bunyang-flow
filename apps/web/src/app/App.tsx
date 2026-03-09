import { Routes, Route } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
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

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />
        <Route
          path="/onboarding"
          element={<OnboardingPage />}
        />
        <Route
          path="/offerings"
          element={<OfferingsListPage />}
        />
        <Route
          path="/offerings/map"
          element={<OfferingsMapPage />}
        />
        <Route
          path="/offerings/:id"
          element={<OfferingDetailPage />}
        />
        <Route
          path="/eligibility"
          element={<EligibilityPage />}
        />
        <Route
          path="/score"
          element={<ScorePage />}
        />
        <Route
          path="/saved"
          element={<SavedPage />}
        />
        <Route
          path="/schedule"
          element={<SchedulePage />}
        />
        <Route
          path="/me"
          element={<ProfilePage />}
        />
        <Route
          path="/compare"
          element={<ComparisonPage />}
        />
      </Routes>
    </AppShell>
  );
}
