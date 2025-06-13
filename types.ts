export enum RatingOption {
  CONFORME = "Conforme",
  NAO_CONFORME = "Não conforme",
  NA = "N/A", // Not Applicable
}

export interface GeneralInfoData {
  ticketNumber: string;
  casa: string;
  serviceDate: string;
  tabulacao: string;
  monitor: string;
  analista: string;
  ticketLink?: string; // Adicionado para o link do Zendesk
}

export interface ChecklistItemData {
  rating: RatingOption | null;
  justification: string;
}

export interface NcgItemData {
  occurred: RatingOption.CONFORME | RatingOption.NAO_CONFORME | null; // Sim for occurred, Nao for not occurred
  justification: string;
}

export interface CustomerExperienceData {
  fcr: string | null; 
  fcrResponsible: string;
  dissatisfactionDuringContact: string | null; 
  attemptToReverseNegativeImage: string | null; 
  customerPraisedService: string | null; 
  complaintPreviousService: string | null; 
  complaintAnalystPosture: string | null; 
  complaintIncorrectInfo: string | null; 
  dissatisfactionWithIA: string | null; 
  threatenLegalAction: string | null; 
}

export interface FormData {
  generalInfo: GeneralInfoData;
  checklistItems: Record<string, ChecklistItemData>; 
  ncgItems: Record<string, NcgItemData>; 
  customerExperience: CustomerExperienceData;
}

export interface ScoreDetails {
  achievedPoints: number;
  applicableCriteriaCount: number;
  isCriticalFailure: boolean;
  finalScore: number;
}

export const CHECKLIST_ITEM_KEYS = [
  "item1", "item2", "item3", "item4", "item5", "item6",
  "item7", "item8", "item9", "item10", "item11", "item12",
] as const;

export type ChecklistItemKey = typeof CHECKLIST_ITEM_KEYS[number];


export const NCG_ITEM_KEYS = [
  "ncg13", "ncg14", "ncg15", "ncg16", "ncg17", "ncg18",
] as const;
export type NcgItemKey = typeof NCG_ITEM_KEYS[number];

export const ALL_QUESTION_KEYS = [...CHECKLIST_ITEM_KEYS, ...NCG_ITEM_KEYS];
export type AllQuestionKey = ChecklistItemKey | NcgItemKey;