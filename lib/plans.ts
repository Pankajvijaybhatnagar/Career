export type PlanId = "FREE" | "STANDARD" | "PREMIUM";

export type Plan = {
  id: PlanId;
  name: string;
  price: number; // INR
  tagline: string;
  reportPages: number; // how many of the 22 pages are unlocked
  prashnaQuestions: number; // total questions allowed per student
  counsellingSessions: number;
  expertReview: boolean;
  features: string[];
};

export const TOTAL_REPORT_PAGES = 22;

/**
 * TESTING SWITCH: while true, every "Unlock" button unlocks the full report instantly
 * (no checkout or payment screen). Set to false when real payments go live.
 */
export const TEST_MODE = true;

export const PLANS: Record<PlanId, Plan> = {
  FREE: {
    id: "FREE",
    name: "Free Preview",
    price: 0,
    tagline: "See a glimpse of your child's stars",
    reportPages: 4,
    prashnaQuestions: 1,
    counsellingSessions: 0,
    expertReview: false,
    features: [
      "Student profile & birth chart (Kundali)",
      "Planet positions & Moon sign",
      "First 4 pages of the report",
      "1 Prashna question (system reading)",
    ],
  },
  STANDARD: {
    id: "STANDARD",
    name: "Career Report",
    price: 1500,
    tagline: "Complete 22-page career guidance report",
    reportPages: 22,
    prashnaQuestions: 5,
    counsellingSessions: 1,
    expertReview: true,
    features: [
      "Full 22-page personalised career report",
      "Palmistry & face reading by our astrologer",
      "Detailed case study of the child",
      "Recommended stream after Class 10",
      "5 Prashna Kundali questions with expert answers",
      "30-minute Google Meet with the astrologer (2–3 days after the form)",
      "Download / print report as PDF",
    ],
  },
  PREMIUM: {
    id: "PREMIUM",
    name: "Premium Guidance",
    price: 3100,
    tagline: "Report + year-long support for parents",
    reportPages: 22,
    prashnaQuestions: 15,
    counsellingSessions: 3,
    expertReview: true,
    features: [
      "Everything in Career Report",
      "15 Prashna Kundali questions",
      "3 Google Meet counselling sessions across the year",
      "Priority review within 48 hours",
      "Exam & admission timing guidance",
    ],
  },
};

export function planOf(id: string | null | undefined): Plan {
  return id && id in PLANS ? PLANS[id as PlanId] : PLANS.FREE;
}

export function isPaid(plan: string) {
  return plan === "STANDARD" || plan === "PREMIUM";
}

export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
