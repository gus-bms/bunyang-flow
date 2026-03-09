import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SpecialSupplyType, UserProfile } from "@bunyang-flow/shared";

interface PreferenceState {
  profile: UserProfile;
  savedOfferingIds: string[];
  comparisonIds: string[];
  alertedOfferingIds: string[];
  onboardingCompleted: boolean;
  updateProfile: (next: Partial<UserProfile>) => void;
  toggleSavedOffering: (offeringId: string) => void;
  toggleComparison: (offeringId: string) => void;
  toggleAlert: (offeringId: string) => void;
  setSpecialSupplyFlags: (flags: SpecialSupplyType[]) => void;
  completeOnboarding: () => void;
}

const defaultProfile: UserProfile = {
  residenceRegion1: "서울",
  isHomeless: true,
  isHeadOfHousehold: true,
  hasSubscriptionAccount: true,
  subscriptionPeriodMonths: 24,
  specialSupplyFlags: ["newlywed"],
  budgetMax: 800000000,
};

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      savedOfferingIds: ["gangdong-river-park", "mapo-central-view"],
      comparisonIds: [],
      alertedOfferingIds: ["gangdong-river-park"],
      onboardingCompleted: false,
      updateProfile: (next) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...next,
          },
        })),
      toggleSavedOffering: (offeringId) =>
        set((state) => ({
          savedOfferingIds: state.savedOfferingIds.includes(offeringId)
            ? state.savedOfferingIds.filter((id) => id !== offeringId)
            : [...state.savedOfferingIds, offeringId],
        })),
      toggleComparison: (offeringId) =>
        set((state) => {
          if (state.comparisonIds.includes(offeringId)) {
            return { comparisonIds: state.comparisonIds.filter((id) => id !== offeringId) };
          }
          if (state.comparisonIds.length >= 5) {
            return state; // 최대 5개 제한
          }
          return { comparisonIds: [...state.comparisonIds, offeringId] };
        }),
      toggleAlert: (offeringId) =>
        set((state) => ({
          alertedOfferingIds: state.alertedOfferingIds.includes(offeringId)
            ? state.alertedOfferingIds.filter((id) => id !== offeringId)
            : [...state.alertedOfferingIds, offeringId],
        })),
      setSpecialSupplyFlags: (flags) =>
        set((state) => ({
          profile: {
            ...state.profile,
            specialSupplyFlags: flags,
          },
        })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
    }),
    {
      name: "bunyang-flow-preferences",
    },
  ),
);
