import React, { useState } from 'react';
import { FormData, CHECKLIST_ITEM_KEYS, NCG_ITEM_KEYS, RatingOption } from '../types';
import { CHECKLIST_QUESTIONS, NCG_QUESTIONS } from '../constants';

interface AIAssistantProps {
  formData: FormData;
}

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M9.315 7.584C10.423 6.425 12.122 6.206 13.52 7.014l.284.175c1.4.81 1.63 2.583.522 3.691l-1.33 1.33a.75.75 0 0 1-1.06 0l-2.002-2.002a.75.75 0 0 1 0-1.06l1.33-1.33ZM15.82 9.275a.75.75 0 0 1 .198 1.045l-.445.622a.75.75 0 0 1-1.06 0l-2.002-2.002a.75.75 0 0 1 0-1.06l.445-.622a.75.75 0 0 1 1.045.198l1.819 1.819Z" clipRule="evenodd" />
    <path d="M10.5 3.75a.75.75 0 0 0-1.5 0v.041c-.868.203-1.66.608-2.316 1.186l-.01.008a.75.75 0 0 0-1.06 1.06l.009.01c.578.656.983 1.448 1.186 2.316H3.75a.75.75 0 0 0 0 1.5h.041c-.203.868-.608 1.66-1.186 2.316l-.008.01a.75.75 0 1 0 1.06 1.06l.01-.009c.656-.578 1.448-.983 2.316-1.186v.041a.75.75 0 0 0 1.5 0v-.041c.868-.203 1.66-.608 2.316-1.186l.01-.008a.75.75 0 1 0-1.06-1.06l-.01.009c-.578-.656-.983-1.448-1.186-2.316h-.041Zm8.379 2.626a.75.75 0 0 1-1.06-1.06l.01-.009c.578-.656.983-1.448 1.186-2.316V3.75a.75.75 0 0 1 1.5 0v.041c-.203.868-.608 1.66-1.186 2.316l-.008.01Zm-2.625 9.12a.75.75 0 0 0 1.06 1.06l.01-.009c.656-.578 1.448-.983 2.316-1.186v.041a.75.75 0 0 0 1.5 0v-.041c-.203-.868-.608-1.66-1.186-2.316l-.008-.01a.75.75 0 1 0-1.06 1.06l.01.009c-.578.656-.983 1.448-1.186 2.316Z" />
  </svg>
);


const AIAssistant: React.FC<AIAssistantProps> = ({ formData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setResult('');
    setError('');

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey.includes("SyAkL06dIf83IU8hizD_r0TaFWhKsTMWmdQ")) { // Basic check for placeholder
      setError("A chave da API do Gemini não foi configurada corretamente no arquivo .env.");
      setIsLoading(false);
      return;
    }

    const itemsToImprove = CHECKLIST_ITEM_KEYS
      .filter(key => formData.checklistItems[key].rating === RatingOption.NAO && formData.checklistItems[key].justification)
      .map(key => `- Pergunta: ${CHECKLIST_QUESTIONS[key]}\n  Justificativa: ${formData.checklistItems[key].justification}`);

    const criticalIssues = NCG_ITEM_KEYS
      .filter(key => formData.ncgItems[key].occurred === RatingOption.SIM && formData.ncgItems[key].justification)
      .map(key => `- Ocorrência: ${NCG_QUESTIONS[key]}\n  Justificativa: ${formData.ncgItems[key].justification}`);

    if (itemsToImprove.length === 0 && criticalIssues.length === 0) {
      setResult("Nenhum ponto de melhoria com justificativa foi encontrado para análise.");
      setIsLoading(false);
      return;
    }

    let prompt = `Você é um especialista em Qualidade de atendimento ao cliente. Sua tarefa é criar um resumo construtivo e profissional para um analista de suporte com base nos pontos de uma avaliação de qualidade. Mantenha um tom de coach, focando em como o analista pode melhorar.

Aqui estão os pontos que precisam de atenção:`;

    if (itemsToImprove.length > 0) {
      prompt += `\n\n**Critérios de Avaliação a Melhorar:**\n${itemsToImprove.join('\n')}`;
    }

    if (criticalIssues.length > 0) {
      prompt += `\n\n**Pontos Críticos (NCG - Não Conformidade Grave):**\n${criticalIssues.join('\n')}`;
    }
    
    prompt += "\n\nCom base nisso, por favor, gere um parágrafo de feedback para o analista. Comece o feedback diretamente, sem introduções como 'Aqui está o resumo'.";


    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error:", errorData);
        throw new Error(`Erro na API do Gemini: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const summary = data.candidates[0]?.content?.parts[0]?.text;

      if (summary) {
        setResult(summary);
      } else {
        throw new Error("A resposta da API do Gemini não continha um resumo válido.");
      }

    } catch (e: any) {
      setError(e.message || "Ocorreu um erro ao gerar o resumo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <h4 className="text-md font-semibold text-slate-700 flex items-center">
        <SparklesIcon className="w-5 h-5 mr-2 text-amber-500" />
        Assistente IA
      </h4>
      <p className="text-xs text-slate-500 mt-1 mb-4">
        Gere um resumo dos pontos de melhoria com base nas justificativas preenchidas.
      </p>
      
      <button
        onClick={handleGenerateSummary}
        disabled={isLoading}
        className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Analisando...' : 'Gerar Resumo'}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-100 p-2 rounded-md border border-red-200">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4">
          <h5 className="text-sm font-semibold text-slate-600">Resumo Gerado:</h5>
          <div className="mt-2 p-3 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-800 whitespace-pre-wrap">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant; 