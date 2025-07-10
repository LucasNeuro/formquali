import { RatingOption, ChecklistItemKey, NcgItemKey, GeneralInfoData, CustomerExperienceData } from './types';

// --- Zendesk API Constants ---
// As constantes da API do Zendesk foram movidas para o arquivo .env.local para maior segurança.
// O código agora as lê de import.meta.env

// --- Question Labels ---
export const CHECKLIST_QUESTIONS: Record<ChecklistItemKey, string> = {
  item1: "1 - Acolhimento e escuta ativa (Cordialidade, empatia, atenção, não ignorar, demonstrar paciência)",
  item2: "2 - Sondagem (Investigou corretamente o problema ou solicitação)",
  item3: "3 - Linguagem profissional (Vocabulário adequado, sem gírias, gerundismo, vícios de linguagem etc.)",
  item4: "4 - Segurança na informação (Utilizar expressões que transmitam segurança, evitando 'não sei, eu acho')",
  item5: "5 - Clareza e objetividade (Informações claras, sem rodeios ou insegurança)",
  item6: "6 - Assertividade técnica (Solução condizente com o problema)",
  item7: "7 - Condução segura (Argumentação adequada, sem gerar dúvidas ou falsa expectativa)",
  item8: "8 - Responsabilidade (Evitou repassar o problema para outras áreas sem justificativa)",
  item9: "9 - Interesse e proatividade (Se antecipou a dúvidas, mostrou interesse genuíno em resolver)",
  item10: "10 - Follow-up (Solicitou dados complementares, orientou próximos passos)",
  item11: "11 - Encerramento (Confirmou se ajudou, finalizou de forma humana e completa)",
  item12: "12 - Tabulação correta (Preencheu os campos necessários no sistema corretamente)",
};

export const NCG_QUESTIONS: Record<NcgItemKey, string> = {
  ncg13: "13 - NCG - Informação incorreta ou falsa",
  ncg14: "14 - NCG - Tempo de Resposta Inadequado - Intervalo superior a 10 minutos sem resposta ou sem sinalização",
  ncg15: "15 - NCG - Linguagem ofensiva ou antiética (Ironia, grosseria, palavrão, palavras de baixo calão etc.)",
  ncg16: "16 - NCG - Risco de prejuízo à empresa (Prejuízo financeiro ou imagem da empresa)",
  ncg17: "17 - NCG - Quebra de ética/exposição da empresa",
  ncg18: "18 - NCG - Promessa Indevida (Prometer ações que não são permitidas)",
};

// --- Webhook Payload Labels ---
export const GENERAL_INFO_LABELS: Record<keyof GeneralInfoData, string> = {
  ticketNumber: "Número do Ticket",
  casa: "Casa",
  serviceDate: "Data do Atendimento",
  tabulacao: "Tabulação",
  monitor: "Monitor",
  analista: "Analista",
  ticketLink: "Link do Ticket Zendesk"
};

export const CUSTOMER_EXPERIENCE_LABELS: Record<keyof CustomerExperienceData, string> = {
  fcr: "FCR - Houve resolução no primeiro contato?",
  fcrResponsible: "FCR - Se não houve resolução, quem foi o responsável?",
  dissatisfactionDuringContact: "O cliente demonstrou insatisfação durante o contato?",
  attemptToReverseNegativeImage: "Houve tentativa de reverter a imagem negativa?",
  customerPraisedService: "O cliente elogiou o atendimento?",
  complaintPreviousService: "Cliente cita reclamação de atendimento anterior?",
  complaintAnalystPosture: "Cliente reclamou da postura do analista?",
  complaintIncorrectInfo: "Cliente reclamou de ter recebido informações Incorretas/ incompletas?",
  dissatisfactionWithIA: "Cliente verbalizou insatisfação com a IA?",
  threatenLegalAction: "Cliente ameaça acionar Orgãos de Justiça (Procon, Reclame Aqui etc.)?"
};

export const SCORE_DETAILS_LABELS = {
  finalScore: "Nota Final (%)",
  achievedPoints: "Pontos Obtidos",
  applicableCriteriaCount: "Critérios Aplicáveis",
  isCriticalFailure: "Falha Crítica NCG Identificada"
};


// --- Rating Options ---
export const POSITIVE_RATING_OPTIONS = [RatingOption.CONFORME, RatingOption.NAO_CONFORME];
export const NCG_RATING_OPTIONS = [RatingOption.CONFORME, RatingOption.NAO_CONFORME]; // Conforme = Atendeu, Não conforme = Não atendeu

// --- Initial Data States ---
export const INITIAL_GENERAL_INFO: GeneralInfoData = {
  ticketNumber: "",
  casa: "",
  serviceDate: "",
  tabulacao: "",
  monitor: "",
  analista: "",
  ticketLink: "", // Adicionado
};

export const INITIAL_CHECKLIST_ITEM_DATA = { rating: null, justification: "" };
export const INITIAL_NCG_ITEM_DATA = { occurred: null, justification: "" };

export const FCR_RESPONSIBLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Selecionar opção...' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'analista', label: 'Analista' },
  { value: 'processo', label: 'Processo' },
  { value: 'outras_areas', label: 'Outras áreas' },
  { value: 'zig', label: 'Zig' },
  { value: 'houve_fcr', label: 'Houve o FCR' },
];

export const YES_NO_SELECT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Selecionar opção..." },
  { value: RatingOption.CONFORME, label: "Conforme" },
  { value: RatingOption.NAO_CONFORME, label: "Não conforme" },
];

export const YES_NO_NA_SELECT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Selecionar opção..." },
  { value: RatingOption.CONFORME, label: "Conforme" },
  { value: RatingOption.NAO_CONFORME, label: "Não conforme" },
];

export const SIM_NAO_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Selecionar opção...' },
  { value: 'Sim', label: 'Sim' },
  { value: 'Não', label: 'Não' },
];

export const SIM_NAO_NA_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Selecionar opção...' },
  { value: 'Sim', label: 'Sim' },
  { value: 'Não', label: 'Não' },
  { value: 'N/A', label: 'N/A' },
];

export const INITIAL_CUSTOMER_EXPERIENCE_DATA: CustomerExperienceData = {
  fcr: null,
  fcrResponsible: "", 
  dissatisfactionDuringContact: null,
  attemptToReverseNegativeImage: null,
  customerPraisedService: null,
  complaintPreviousService: null,
  complaintAnalystPosture: null,
  complaintIncorrectInfo: null,
  dissatisfactionWithIA: null,
  threatenLegalAction: null,
};