/// <reference types="vite/client" />

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  FormData,
  ChecklistItemData,
  NcgItemData,
  CustomerExperienceData,
  GeneralInfoData,
  RatingOption,
  ScoreDetails,
  ChecklistItemKey,
  NcgItemKey,
  CHECKLIST_ITEM_KEYS,
  NCG_ITEM_KEYS
} from './types';
import {
  CHECKLIST_QUESTIONS,
  NCG_QUESTIONS,
  INITIAL_GENERAL_INFO,
  INITIAL_CHECKLIST_ITEM_DATA,
  INITIAL_NCG_ITEM_DATA,
  INITIAL_CUSTOMER_EXPERIENCE_DATA,
  FCR_RESPONSIBLE_OPTIONS,
  YES_NO_SELECT_OPTIONS,
  YES_NO_NA_SELECT_OPTIONS,
  // Zendesk and Label constants
  GENERAL_INFO_LABELS,
  CUSTOMER_EXPERIENCE_LABELS,
  SCORE_DETAILS_LABELS
} from './constants';

import Header from './components/Header';
import SectionCard from './components/SectionCard';
import FormField from './components/FormField';
import TextInput from './components/TextInput';
import DateInput from './components/DateInput';
import ChecklistItemDisplay from './components/ChecklistItemDisplay';
import NCGItemDisplay from './components/NCGItemDisplay';
import CustomerExperienceQuestion from './components/CustomerExperienceQuestion';
import SubmitSection from './components/SubmitSection';
import SideOverProgress, { ProgressSection } from './components/SideOverProgress';
import { createClient } from '@supabase/supabase-js';
import Login from './components/Login';

const initialChecklistItems = CHECKLIST_ITEM_KEYS.reduce((acc, key) => {
  acc[key] = { ...INITIAL_CHECKLIST_ITEM_DATA };
  return acc;
}, {} as Record<ChecklistItemKey, ChecklistItemData>);

const initialNcgItems = NCG_ITEM_KEYS.reduce((acc, key) => {
  acc[key] = { ...INITIAL_NCG_ITEM_DATA };
  return acc;
}, {} as Record<NcgItemKey, NcgItemData>);

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;
const ZENDESK_SUBDOMAIN = import.meta.env.VITE_ZENDESK_SUBDOMAIN;
const ZENDESK_EMAIL = import.meta.env.VITE_ZENDESK_EMAIL;
const ZENDESK_API_TOKEN = import.meta.env.VITE_ZENDESK_API_TOKEN;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SECTION_IDS = {
  generalInfo: 'generalInfoSection',
  checklist: 'checklistSection',
  ncg: 'ncgSection',
  customerExperience: 'customerExperienceSection',
  submit: 'submit-section',
} as const;

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    generalInfo: { ...INITIAL_GENERAL_INFO },
    checklistItems: initialChecklistItems,
    ncgItems: initialNcgItems,
    customerExperience: { ...INITIAL_CUSTOMER_EXPERIENCE_DATA },
  });

  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [scoreDetails, setScoreDetails] = useState<ScoreDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  
  // Zendesk state
  const [isFetchingTicketInfo, setIsFetchingTicketInfo] = useState<boolean>(false);
  const [zendeskFetchError, setZendeskFetchError] = useState<string | null>(null);
  const [ticketMeta, setTicketMeta] = useState<any | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const HEADER_HEIGHT = 80;

  // Persistência local do formulário
  useEffect(() => {
    const saved = localStorage.getItem('formquali_formData');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('formquali_formData', JSON.stringify(formData));
  }, [formData]);

  const handleGeneralInfoChange = (field: keyof GeneralInfoData, value: string) => {
    setFormData((prev: FormData) => {
        const newGeneralInfo = { ...prev.generalInfo, [field]: value };
        // Clear ticketLink if ticketNumber changes
        if (field === 'ticketNumber') {
            newGeneralInfo.ticketLink = ""; 
        }
        return { ...prev, generalInfo: newGeneralInfo };
    });
    setInvalidFields(prev => {
        const next = new Set(prev);
        next.delete(field as string);
        return next;
    });
  };
  
  // Função para buscar dados do ticket via proxy Node.js
  const handleTicketNumberBlur = async (ticketId: string) => {
    if (!ticketId.trim()) return;
    // Gera o link do ticket
    const ticketUrl = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/agent/tickets/${ticketId}`;
    setFormData((prev: FormData) => ({ ...prev, generalInfo: { ...prev.generalInfo, ticketLink: ticketUrl } }));
    setTicketMeta(null);

    // Busca dados do ticket via proxy
    try {
      setIsFetchingTicketInfo(true);
      setZendeskFetchError(null);
      const resp = await fetch('http://localhost:3001/api/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketNumber: ticketId })
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Erro ao buscar ticket');
      }
      const ticket = await resp.json();
      setFormData((prev: FormData) => ({
        ...prev,
        generalInfo: {
          ...prev.generalInfo,
          casa: ticket.casa || '',
          tabulacao: ticket.tags ? ticket.tags.join(', ') : '',
          analista: ticket.assignee_name || '',
        }
      }));
      setTicketMeta(ticket);
    } catch (err: any) {
      setZendeskFetchError(err.message || 'Erro ao buscar ticket');
    } finally {
      setIsFetchingTicketInfo(false);
    }
  };

  const handleChecklistItemChange = (itemKey: ChecklistItemKey, field: keyof ChecklistItemData, value: string | RatingOption | null) => {
    setFormData((prev: FormData) => ({
      ...prev,
      checklistItems: {
        ...prev.checklistItems,
        [itemKey]: { ...prev.checklistItems[itemKey], [field]: value },
      },
    }));
    if (field === 'rating') {
        setInvalidFields(prev => {
            const next = new Set(prev);
            next.delete(itemKey);
            return next;
        });
    }
  };

  const handleNcgItemChange = (itemKey: NcgItemKey, field: keyof NcgItemData, value: string | RatingOption.CONFORME | RatingOption.NAO_CONFORME | null) => {
    setFormData((prev: FormData) => ({
      ...prev,
      ncgItems: {
        ...prev.ncgItems,
        [itemKey]: { ...prev.ncgItems[itemKey], [field]: value },
      },
    }));
     if (field === 'occurred') {
        setInvalidFields(prev => {
            const next = new Set(prev);
            next.delete(itemKey);
            return next;
        });
    }
  };
  
  const handleCustomerExperienceChange = (field: keyof CustomerExperienceData, value: string | null) => { 
    setFormData((prev: FormData) => ({
      ...prev,
      customerExperience: { ...prev.customerExperience, [field]: value },
    }));
    setInvalidFields(prev => {
        const next = new Set(prev);
        next.delete(field as string);
        if (field === 'fcr' && value !== "Não") {
            next.delete('fcrResponsible');
        }
        if (field === 'dissatisfactionDuringContact' && value !== "Sim") {
            next.delete('attemptToReverseNegativeImage');
        }
        return next;
    });
  };

  const calculateScore = useCallback((): ScoreDetails => {
    let isCriticalFailure = false;
    for (const key of NCG_ITEM_KEYS) {
      if (formData.ncgItems[key].occurred === RatingOption.NAO_CONFORME) {
        isCriticalFailure = true;
        break;
      }
    }

    if (isCriticalFailure) {
      return { finalScore: 0, achievedPoints: 0, applicableCriteriaCount: CHECKLIST_ITEM_KEYS.length, isCriticalFailure: true };
    }

    let achievedPoints = 0;
    let applicableCriteriaCount = 0;

    for (const key of CHECKLIST_ITEM_KEYS) {
      const item = formData.checklistItems[key];
      if (item.rating !== RatingOption.NA) {
        applicableCriteriaCount++;
        if (item.rating === RatingOption.CONFORME) {
          achievedPoints++;
        }
      }
    }
    
    const finalScoreValue = applicableCriteriaCount > 0 ? (achievedPoints / applicableCriteriaCount) * 100 : 100;

    return {
      finalScore: parseFloat(finalScoreValue.toFixed(2)),
      achievedPoints,
      applicableCriteriaCount,
      isCriticalFailure: false,
    };
  }, [formData.checklistItems, formData.ncgItems]);

  const scrollToElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - HEADER_HEIGHT - 20; 

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        element.classList.add('ring-2', 'ring-offset-2', 'ring-sky-500', 'transition-all', 'duration-1000', 'ease-in-out');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-offset-2', 'ring-sky-500', 'transition-all', 'duration-1000', 'ease-in-out');
        }, 2000);
    } else {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }, [HEADER_HEIGHT]);

  const transformDataForWebhook = useCallback((data: FormData, score: ScoreDetails): Record<string, any> => {
    const transformed: Record<string, any> = {
      "Dados da Avaliação": {
        "Informações da Monitoria": {},
        "Critérios de Avaliação (1-12)": {},
        "Critérios NCG - Não Conformidade Grave (13-18)": {},
        "Avaliação Experiência do Cliente": {}
      },
      "Resultado da Avaliação": {},
      "Timestamp da Submissão": new Date().toISOString()
    };
  
    // Informações da Monitoria
    for (const key in data.generalInfo) {
      const typedKey = key as keyof GeneralInfoData;
      transformed["Dados da Avaliação"]["Informações da Monitoria"][GENERAL_INFO_LABELS[typedKey] || typedKey] = data.generalInfo[typedKey];
    }
  
    // Critérios de Avaliação
    for (const key of CHECKLIST_ITEM_KEYS) {
      transformed["Dados da Avaliação"]["Critérios de Avaliação (1-12)"][CHECKLIST_QUESTIONS[key]] = {
        "Avaliação": data.checklistItems[key].rating,
        "Justificativa": data.checklistItems[key].justification
      };
    }
  
    // Critérios NCG
    for (const key of NCG_ITEM_KEYS) {
      transformed["Dados da Avaliação"]["Critérios NCG - Não Conformidade Grave (13-18)"][NCG_QUESTIONS[key]] = {
        "Ocorrência": data.ncgItems[key].occurred,
        "Justificativa": data.ncgItems[key].justification
      };
    }
  
    // Avaliação Experiência do Cliente
    for (const key in data.customerExperience) {
      const typedKey = key as keyof CustomerExperienceData;
      transformed["Dados da Avaliação"]["Avaliação Experiência do Cliente"][CUSTOMER_EXPERIENCE_LABELS[typedKey] || typedKey] = data.customerExperience[typedKey];
    }

    // Resultado da Avaliação
    transformed["Resultado da Avaliação"][SCORE_DETAILS_LABELS.finalScore] = score.finalScore;
    transformed["Resultado da Avaliação"][SCORE_DETAILS_LABELS.achievedPoints] = score.achievedPoints;
    transformed["Resultado da Avaliação"][SCORE_DETAILS_LABELS.applicableCriteriaCount] = score.applicableCriteriaCount;
    transformed["Resultado da Avaliação"][SCORE_DETAILS_LABELS.isCriticalFailure] = score.isCriticalFailure;
  
    return transformed;
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setSubmitError(null);
    setSuccessMessage(null);
    setFinalScore(null); 
    const newInvalidFields = new Set<string>();

    const { generalInfo, customerExperience } = formData;
    if (!generalInfo.ticketNumber) { newInvalidFields.add('ticketNumber');}
    if (!generalInfo.serviceDate) { newInvalidFields.add('serviceDate');}
    if (!generalInfo.analista) { newInvalidFields.add('analista');}
    if (!generalInfo.monitor) { newInvalidFields.add('monitor');}

    if (newInvalidFields.size > 0) {
        setSubmitError("Por favor, preencha os campos obrigatórios da seção 'Monitoria Analista'.");
        setInvalidFields(newInvalidFields);
        scrollToElement(Array.from(newInvalidFields)[0]);
        return;
    }
    
    let firstErrorField: string | undefined = undefined;

    for (const key of CHECKLIST_ITEM_KEYS) {
        if (formData.checklistItems[key].rating === null) {
            newInvalidFields.add(key);
            if (!firstErrorField) firstErrorField = key;
        }
    }
     for (const key of NCG_ITEM_KEYS) {
        if (formData.ncgItems[key].occurred === null) {
            newInvalidFields.add(key);
            if (!firstErrorField) firstErrorField = key;
        }
    }
    
    const customerExperienceValidation: Array<{field: keyof CustomerExperienceData, condition?: () => boolean, message: string, idToScroll: string}> = [
        { field: 'fcr', message: "Por favor, responda à questão 'FCR - Houve resolução no primeiro contato?'.", idToScroll: 'fcr'},
        { field: 'fcrResponsible', condition: () => customerExperience.fcr === "Não", message: "Por favor, selecione o responsável em 'FCR - Se não houve resolução, quem foi o responsável?'.", idToScroll: 'fcrResponsible'},
        { field: 'dissatisfactionDuringContact', message: "Por favor, responda à questão 'O cliente demonstrou insatisfação durante o contato?'.", idToScroll: 'dissatisfactionDuringContact'},
        { field: 'attemptToReverseNegativeImage', condition: () => customerExperience.dissatisfactionDuringContact === "Sim", message: "Por favor, responda à questão 'Houve tentativa de reverter a imagem negativa?'.", idToScroll: 'attemptToReverseNegativeImage'},
        { field: 'customerPraisedService', message: "Por favor, responda à questão 'O cliente elogiou o atendimento?'.", idToScroll: 'customerPraisedService'},
        { field: 'complaintPreviousService', message: "Cliente cita reclamação de atendimento anterior?", idToScroll: 'complaintPreviousService'},
        { field: 'complaintAnalystPosture', message: "Cliente reclamou da postura do analista?", idToScroll: 'complaintAnalystPosture'},
        { field: 'complaintIncorrectInfo', message: "Cliente reclamou de ter recebido informações Incorretas/ incompletas?", idToScroll: 'complaintIncorrectInfo'},
        { field: 'dissatisfactionWithIA', message: "Cliente verbalizou insatisfação com a IA?", idToScroll: 'dissatisfactionWithIA'},
        { field: 'threatenLegalAction', message: "Cliente ameaça acionar Orgãos de Justiça (Procon, Reclame Aqui etc.)?", idToScroll: 'threatenLegalAction'},
    ];

    for (const rule of customerExperienceValidation) {
        if (rule.condition === undefined || rule.condition()) { 
            if (!customerExperience[rule.field] || (typeof customerExperience[rule.field] === 'string' && (customerExperience[rule.field] as string).trim() === "")) {
                newInvalidFields.add(rule.idToScroll); 
                 if (!firstErrorField) firstErrorField = rule.idToScroll;
                if (!submitError) { 
                    setSubmitError(rule.message); // Set only the first CX error message
                }
            }
        }
    }

    if (newInvalidFields.size > 0) {
        if (!submitError) { // If no specific CX error was set, set a generic one for checklist/NCG
             if (Array.from(newInvalidFields).some(k => CHECKLIST_ITEM_KEYS.includes(k as ChecklistItemKey))) {
                setSubmitError(`Por favor, responda a todas as questões da checklist (1-12).`);
            } else if (Array.from(newInvalidFields).some(k => NCG_ITEM_KEYS.includes(k as NcgItemKey))) {
                setSubmitError(`Por favor, responda a todas as questões NCG (13-18).`);
            }
        }
        setInvalidFields(newInvalidFields);
        scrollToElement(firstErrorField || Array.from(newInvalidFields)[0]);
        return;
    }

    setInvalidFields(new Set()); 

    const calculatedScoreDetails = calculateScore();
    setFinalScore(calculatedScoreDetails.finalScore);
    setScoreDetails(calculatedScoreDetails);
    
    setIsSubmitting(true);

    try {
      // Transformar dados para o formato do webhook
      const webhookData = transformDataForWebhook(formData, calculatedScoreDetails);
      
      // Tenta enviar para o webhook via backend, mas não interrompe o salvamento se falhar
      try {
        const webhookResponse = await fetch('http://localhost:3001/api/send-webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: webhookData })
        });
        if (!webhookResponse.ok) {
          console.warn('Falha ao enviar para o webhook, mas continuando com o salvamento no banco.');
        }
      } catch (err) {
        console.warn('Erro ao enviar para o webhook:', err);
      }

      // Transformar checklist e ncg para usar o nome da pergunta como chave
      const respostas_checklist_nome: Record<string, ChecklistItemData> = {};
      for (const key of CHECKLIST_ITEM_KEYS) {
        respostas_checklist_nome[CHECKLIST_QUESTIONS[key]] = formData.checklistItems[key];
      }
      const respostas_ncg_nome: Record<string, NcgItemData> = {};
      for (const key of NCG_ITEM_KEYS) {
        respostas_ncg_nome[NCG_QUESTIONS[key]] = formData.ncgItems[key];
      }
      // Experiência do Cliente: salvar com nome da pergunta e justificativa se houver
      const experiencia_cliente_nome: Record<string, { resposta: string | null, justificativa?: string }> = {};
      for (const key in formData.customerExperience) {
        const label = CUSTOMER_EXPERIENCE_LABELS[key as keyof CustomerExperienceData] || key;
        const resposta = formData.customerExperience[key as keyof CustomerExperienceData];
        experiencia_cliente_nome[label] = { resposta };
      }

      // Salvar no Supabase
      const { data, error } = await supabase
        .from('monitorias')
        .insert([{
          ticket_number: formData.generalInfo.ticketNumber,
          ticket_link: formData.generalInfo.ticketLink,
          tabulacao: formData.generalInfo.tabulacao,
          casa: formData.generalInfo.casa,
          data_atendimento: formData.generalInfo.serviceDate,
          monitor: formData.generalInfo.monitor,
          analista: formData.generalInfo.analista,
          respostas_checklist: respostas_checklist_nome,
          respostas_ncg: respostas_ncg_nome,
          experiencia_cliente: experiencia_cliente_nome,
          nota_final: calculatedScoreDetails.finalScore,
        }]);

      if (error) {
        throw new Error('Erro ao salvar no Supabase: ' + error.message);
      }

      setSuccessMessage('Avaliação enviada com sucesso!');
    } catch (error: any) {
      setSubmitError('Erro ao enviar avaliação: ' + (error.message || error.toString()));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Logic for SideOverProgress ---
  const isGeneralInfoComplete = useMemo(() => {
    const { generalInfo } = formData;
    return !!generalInfo.ticketNumber && !!generalInfo.serviceDate && !!generalInfo.analista && !!generalInfo.monitor;
  }, [formData.generalInfo]);

  const isChecklistComplete = useMemo(() => {
    return CHECKLIST_ITEM_KEYS.every(key => formData.checklistItems[key].rating !== null);
  }, [formData.checklistItems]);

  const isNcgComplete = useMemo(() => {
    return NCG_ITEM_KEYS.every(key => formData.ncgItems[key].occurred !== null);
  }, [formData.ncgItems]);

  const isCustomerExperienceComplete = useMemo(() => {
    const { customerExperience } = formData;
    if (!customerExperience.fcr) return false;
    if (customerExperience.fcr === "Não" && !customerExperience.fcrResponsible) return false;
    if (!customerExperience.dissatisfactionDuringContact) return false;
    if (customerExperience.dissatisfactionDuringContact === "Sim" && !customerExperience.attemptToReverseNegativeImage) return false;
    if (!customerExperience.customerPraisedService) return false;
    if (!customerExperience.complaintPreviousService) return false;
    if (!customerExperience.complaintAnalystPosture) return false;
    if (!customerExperience.complaintIncorrectInfo) return false;
    if (!customerExperience.dissatisfactionWithIA) return false;
    if (!customerExperience.threatenLegalAction) return false;
    return true;
  }, [formData.customerExperience]);

  const progressSections: ProgressSection[] = useMemo(() => [
    { id: SECTION_IDS.generalInfo, title: 'Informações da Monitoria', isComplete: isGeneralInfoComplete },
    { id: SECTION_IDS.checklist, title: 'Critérios de Avaliação', isComplete: isChecklistComplete },
    { id: SECTION_IDS.ncg, title: 'Critérios NCG', isComplete: isNcgComplete },
    { id: SECTION_IDS.customerExperience, title: 'Experiência do Cliente', isComplete: isCustomerExperienceComplete },
    { id: SECTION_IDS.submit, title: 'Envio e Resultado', isComplete: finalScore !== null && !submitError },
  ], [isGeneralInfoComplete, isChecklistComplete, isNcgComplete, isCustomerExperienceComplete, finalScore, submitError]);

  // Função de login
  const handleLogin = async (username: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const { data, error } = await supabase
        .from('avaliadores')
        .select('*')
        .eq('email', username)
        .eq('senha', password)
        .single();
      if (error || !data) {
        setLoginError('Usuário ou senha inválidos.');
        setIsLoggingIn(false);
        return;
      }
      setIsAuthenticated(true);
      setCurrentUser(data.email);
    } catch (e) {
      setLoginError('Erro ao tentar logar.');
    }
    setIsLoggingIn(false);
  };

  // Função de logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoginError(null);
    setIsLoggingIn(false);
    // (Opcional) Limpar dados do formulário, se quiser
    // setFormData({ ... });
  };

  // Se não autenticado, mostra tela de login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={loginError} isLoading={isLoggingIn} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Checklist Qualidade Suporte B2B" subtitle="v.1 - Monitoria Analista" onLogout={handleLogout} />
      
      <div className="flex flex-row h-[calc(100vh-104px)]"> {/* 104px = header (p-6) + border */}
        <main className="flex-1 p-4 md:p-8 space-y-8 max-w-5xl mx-auto h-full overflow-y-auto">
          <SectionCard title="Monitoria Analista" id={SECTION_IDS.generalInfo}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField label="Número do Ticket" htmlFor="ticketNumber" required>
                <div className="flex items-center gap-2">
                <TextInput 
                  id="ticketNumber" 
                  value={formData.generalInfo.ticketNumber} 
                  onChange={(e) => handleGeneralInfoChange('ticketNumber', e.target.value)} 
                    onBlur={(e) => handleTicketNumberBlur(e.target.value)}
                  isInvalid={invalidFields.has('ticketNumber')} 
                />
                 {formData.generalInfo.ticketLink && !isFetchingTicketInfo && !zendeskFetchError && (
                    <a href={formData.generalInfo.ticketLink} target="_blank" rel="noopener noreferrer" title="Abrir Ticket" className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6m0 0v6m0-6L10 14" /></svg>
                      Abrir
                    </a>
                  )}
                </div>
                {isFetchingTicketInfo && (
                  <div className="flex items-center gap-2 mt-2 text-sky-600">
                    <svg className="animate-spin h-5 w-5 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    Buscando informações do ticket...
                  </div>
                )}
                {zendeskFetchError && <p className="text-sm text-red-600 mt-1">{zendeskFetchError}</p>}
              </FormField>
              <FormField label="Casa" htmlFor="casa">
                <TextInput id="casa" value={formData.generalInfo.casa} onChange={(e) => handleGeneralInfoChange('casa', e.target.value)} />
              </FormField>
              <FormField label="Data do Atendimento" htmlFor="serviceDate" required>
                <DateInput id="serviceDate" value={formData.generalInfo.serviceDate} onChange={(e) => handleGeneralInfoChange('serviceDate', e.target.value)} isInvalid={invalidFields.has('serviceDate')} />
              </FormField>
              <FormField label="Monitor" htmlFor="monitor" required>
                <TextInput id="monitor" value={formData.generalInfo.monitor} onChange={(e) => handleGeneralInfoChange('monitor', e.target.value)} isInvalid={invalidFields.has('monitor')} />
              </FormField>
              <FormField label="Analista" htmlFor="analista" required>
                <TextInput id="analista" value={formData.generalInfo.analista} onChange={(e) => handleGeneralInfoChange('analista', e.target.value)} isInvalid={invalidFields.has('analista')} />
              </FormField>
            </div>
            {/* Card de metadados do ticket - agora abaixo dos campos */}
            {ticketMeta && !isFetchingTicketInfo && !zendeskFetchError && (
              <div className="mt-6 w-4/5 mx-auto p-5 bg-white border border-slate-200 rounded-xl shadow flex flex-col gap-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {ticketMeta.tags && ticketMeta.tags.map((tag: string) => (
                    <span key={tag} className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-700">
                  <div><b>Status:</b> {ticketMeta.status}</div>
                  <div><b>Prioridade:</b> {ticketMeta.priority || 'N/A'}</div>
                  <div><b>Criado em:</b> {ticketMeta.created_at ? new Date(ticketMeta.created_at).toLocaleString() : 'N/A'}</div>
                  <div><b>ID do Ticket:</b> {ticketMeta.id}</div>
                  <div><b>Casa:</b> {ticketMeta.organization_name || ticketMeta.organization_id || 'N/A'}</div>
                  <div><b>Solicitante:</b> {ticketMeta.requester_name || ticketMeta.requester_id || 'N/A'}</div>
                  <div>
                    <b>Atribuído para:</b> {ticketMeta.assignee_name || ticketMeta.assignee_id || 'N/A'}
                    {ticketMeta.assignee_email && (
                      <span className="block text-xs text-slate-500">{ticketMeta.assignee_email}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Critérios de Avaliação (1-12)" id={SECTION_IDS.checklist}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {CHECKLIST_ITEM_KEYS.map(key => (
                      <ChecklistItemDisplay
                          key={key}
                          id={key} 
                          question={CHECKLIST_QUESTIONS[key]}
                          data={formData.checklistItems[key]}
                          onChange={(field, value) => handleChecklistItemChange(key, field as keyof ChecklistItemData, value)}
                          isInvalid={invalidFields.has(key)}
                      />
                  ))}
              </div>
          </SectionCard>

          <SectionCard title="Critérios NCG - Não Conformidade Grave (13-18)" id={SECTION_IDS.ncg}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {NCG_ITEM_KEYS.map(key => (
                      <NCGItemDisplay
                          key={key}
                          id={key} 
                          question={NCG_QUESTIONS[key]}
                          data={formData.ncgItems[key]}
                          onChange={(field, value) => handleNcgItemChange(key, field as keyof NcgItemData, value as RatingOption.CONFORME | RatingOption.NAO_CONFORME | string | null)}
                          isInvalid={invalidFields.has(key)}
                      />
                  ))}
              </div>
          </SectionCard>

          <SectionCard title="Avaliação Experiência do Cliente" id={SECTION_IDS.customerExperience}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <CustomerExperienceQuestion 
                      id="fcr" label="FCR - Houve resolução no primeiro contato?" type="select" 
                      value={formData.customerExperience.fcr} 
                      onChange={val => handleCustomerExperienceChange('fcr', val as string | null)}
                      selectOptions={YES_NO_SELECT_OPTIONS}
                      required
                      isInvalid={invalidFields.has('fcr')}
                  />
                  <CustomerExperienceQuestion 
                      id="fcrResponsible" label="FCR - Se não houve resolução, quem foi o responsável?" type="select" 
                      value={formData.customerExperience.fcrResponsible} 
                      onChange={val => handleCustomerExperienceChange('fcrResponsible', val as string | null)} 
                      required={formData.customerExperience.fcr === "Não"}
                      selectOptions={FCR_RESPONSIBLE_OPTIONS}
                      isInvalid={invalidFields.has('fcrResponsible')}
                  />
                  <CustomerExperienceQuestion 
                      id="dissatisfactionDuringContact" label="O cliente demonstrou insatisfação durante o contato?" type="select" 
                      value={formData.customerExperience.dissatisfactionDuringContact} 
                      onChange={val => handleCustomerExperienceChange('dissatisfactionDuringContact', val as string | null)} 
                      selectOptions={YES_NO_SELECT_OPTIONS}
                      required
                      isInvalid={invalidFields.has('dissatisfactionDuringContact')}
                  />
                  <CustomerExperienceQuestion 
                      id="attemptToReverseNegativeImage" label="Houve tentativa de reverter a imagem negativa?" type="select" 
                      value={formData.customerExperience.attemptToReverseNegativeImage} 
                      onChange={val => handleCustomerExperienceChange('attemptToReverseNegativeImage', val as string | null)}
                      required={formData.customerExperience.dissatisfactionDuringContact === "Sim"}
                      selectOptions={YES_NO_NA_SELECT_OPTIONS}
                      isInvalid={invalidFields.has('attemptToReverseNegativeImage')}
                  />
                  <CustomerExperienceQuestion 
                      id="customerPraisedService" label="O cliente elogiou o atendimento?" type="select" 
                      value={formData.customerExperience.customerPraisedService} 
                      onChange={val => handleCustomerExperienceChange('customerPraisedService', val as string | null)} 
                      selectOptions={YES_NO_SELECT_OPTIONS}
                      required
                      isInvalid={invalidFields.has('customerPraisedService')}
                  />
                  <CustomerExperienceQuestion 
                      id="complaintPreviousService" label="Cliente cita reclamação de atendimento anterior?" type="select" 
                      value={formData.customerExperience.complaintPreviousService} 
                      onChange={val => handleCustomerExperienceChange('complaintPreviousService', val as string | null)} 
                      selectOptions={YES_NO_SELECT_OPTIONS}
                      required
                      isInvalid={invalidFields.has('complaintPreviousService')}
                  />
                  <CustomerExperienceQuestion 
                      id="complaintAnalystPosture" label="Cliente reclamou da postura do analista?" type="select" 
                      value={formData.customerExperience.complaintAnalystPosture} 
                      onChange={val => handleCustomerExperienceChange('complaintAnalystPosture', val as string | null)} 
                      selectOptions={YES_NO_SELECT_OPTIONS}
                      required
                      isInvalid={invalidFields.has('complaintAnalystPosture')}
                  />
                  <CustomerExperienceQuestion 
                      id="complaintIncorrectInfo" label="Cliente reclamou de ter recebido informações Incorretas/ incompletas?" type="select" 
                      value={formData.customerExperience.complaintIncorrectInfo} 
                      onChange={val => handleCustomerExperienceChange('complaintIncorrectInfo', val as string | null)} 
                      selectOptions={YES_NO_SELECT_OPTIONS}
                      required
                      isInvalid={invalidFields.has('complaintIncorrectInfo')}
                  />
                  <CustomerExperienceQuestion 
                      id="dissatisfactionWithIA" label="Cliente verbalizou insatisfação com a IA?" type="select" 
                      value={formData.customerExperience.dissatisfactionWithIA} 
                      onChange={val => handleCustomerExperienceChange('dissatisfactionWithIA', val as string | null)} 
                      selectOptions={YES_NO_NA_SELECT_OPTIONS}
                      required
                      isInvalid={invalidFields.has('dissatisfactionWithIA')}
                  />
                  <CustomerExperienceQuestion 
                      id="threatenLegalAction" label="Cliente ameaça acionar Orgãos de Justiça (Procon, Reclame Aqui etc.)?" type="select" 
                      value={formData.customerExperience.threatenLegalAction} 
                      onChange={val => handleCustomerExperienceChange('threatenLegalAction', val as string | null)} 
                      selectOptions={YES_NO_SELECT_OPTIONS}
                      required
                      isInvalid={invalidFields.has('threatenLegalAction')}
                  />
              </div>
          </SectionCard>
          
          <SubmitSection
              id={SECTION_IDS.submit}
              finalScore={finalScore}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={submitError}
              successMessage={successMessage}
          />
        </main>
        
        <aside className="hidden lg:block h-full">
        <SideOverProgress 
            sections={progressSections} 
            onSectionClick={scrollToElement} 
              headerHeight={0} // Not needed anymore
              formData={formData}
        />
        </aside>

      </div>
      <footer className="text-center p-4 text-sm text-slate-500 mt-auto">
        &copy; {new Date().getFullYear()} Quality Checklist App. All rights reserved.
      </footer>
    </div>
  );
};

export default App;