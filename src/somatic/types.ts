export type SomaticSignature = {
  sensoryIds: string[];
  narrativeIds: string[];
  fieldShape: {
    closenessBand: "low" | "mid" | "high";
    fragilityBand: "low" | "mid" | "high";
    urgencyBand: "low" | "mid" | "high";
    answerPressureBand: "low" | "mid" | "high";
  };
};

export type SomaticMarkerOutcome = {
  naturalness: number;   // -1.0 - 1.0
  safety: number;        // -1.0 - 1.0
  helpfulness: number;   // -1.0 - 1.0
  openness: number;      // -1.0 - 1.0
};

export type SomaticMarker = {
  id: string;
  signature: SomaticSignature;
  decisionShape: {
    stance: "hold" | "answer" | "soft_answer" | "open_reflect";
    shouldAnswerQuestion: boolean;
    shouldOfferStep: boolean;
    shouldStayOpen: boolean;
  };
  outcome: SomaticMarkerOutcome;
  count: number;
  updatedAt: number;
};

export type SomaticInfluence = {
  matchedMarkerIds: string[];
  averageOutcome: SomaticMarkerOutcome;
  influenceStrength: number; // 0.0 - 1.0
  debugNotes: string[];
};
