/**
 * lib/chat.ts — scoped knowledge base for the Chat Assistant (build.md AI CHAT).
 * No LLM: the assistant answers from this fixed set via quick-reply buttons, then
 * hands off to a human through the shared lead pipeline (source: "chat").
 * Pricing is given as RANGES, never exact quotes.
 */

export type ChatTopic = {
  id: string;
  label: string;
  answer: string;
  /** ids of follow-up topics offered after this answer */
  followups: string[];
};

/** Stated on the first message — it's an assistant, not a team member. */
export const CHAT_DISCLAIMER =
  "Hey — I'm the Iqballaz assistant, not a team member, just here to help you get started.";

export const CHAT_INTRO =
  "What can I help with?";

/** The special handoff action id. */
export const HANDOFF = "handoff";

export const MAIN_OPTIONS = ["services", "pricing", "financing", "hours", HANDOFF];

export const chatTopics: Record<string, ChatTopic> = {
  services: {
    id: "services",
    label: "Services",
    answer:
      "We do vinyl wraps, ceramic tint, paint protection film (PPF), starlight headliners, and wheel powder coating — with a heavy focus on Tesla builds.",
    followups: ["pricing", "wrap-faq", "tint-faq", "ppf-faq", HANDOFF],
  },
  pricing: {
    id: "pricing",
    label: "Pricing",
    answer:
      "Rough ranges to set expectations (your exact quote comes from the shop): full wraps from ~$2,800, ceramic tint from ~$200, powder coat ~$150 per wheel. PPF and starlight headliners are priced per vehicle.",
    followups: ["financing", HANDOFF, "services"],
  },
  financing: {
    id: "financing",
    label: "Financing",
    answer:
      "Financing is available — you can split the cost of a build across payments. Mention it when you request a quote and we'll walk you through the options.",
    followups: ["pricing", HANDOFF],
  },
  hours: {
    id: "hours",
    label: "Hours & location",
    answer:
      "We're at 5819 Richmond Ave, Houston, TX 77057. Mon–Fri 10–6, Saturday by appointment, closed Sunday. By appointment only — (832) 208-1071.",
    followups: [HANDOFF, "services"],
  },
  "wrap-faq": {
    id: "wrap-faq",
    label: "Wrap FAQ",
    answer:
      "A quality wrap lasts ~5–7 years, protects your factory paint, and removes cleanly. A full wrap is usually 3–5 days in the shop. We wrap stainless Cybertrucks too.",
    followups: ["pricing", HANDOFF, "services"],
  },
  "tint-faq": {
    id: "tint-faq",
    label: "Tint FAQ",
    answer:
      "Ceramic tint blocks heat and UV without going purple like cheap film. Texas allows 25% on front side windows. Let it cure 3–5 days before rolling windows down.",
    followups: ["pricing", HANDOFF, "services"],
  },
  "ppf-faq": {
    id: "ppf-faq",
    label: "PPF FAQ",
    answer:
      "PPF is a clear, self-healing film that takes rock chips and swirl instead of your paint — roughly a 10-year warranty, in clear gloss or stealth satin.",
    followups: ["pricing", HANDOFF, "services"],
  },
};
