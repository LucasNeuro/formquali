import React from 'react';
// FormField and TextInput are not used here anymore if webhook config is fully removed.
// import FormField from './FormField';
// import TextInput from './TextInput';

interface SubmitSectionProps {
  id: string; // For scrolling
  finalScore: number | null;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
}

const SubmitSection: React.FC<SubmitSectionProps> = ({
  id,
  finalScore,
  onSubmit,
  isSubmitting,
  error,
  successMessage,
}) => {

  return (
    <div id={id} className="bg-white shadow-xl rounded-xl p-6 md:p-8">
      <h3 className="text-2xl font-semibold text-slate-700 mb-6 border-b pb-3 border-slate-200">Envio e Resultado</h3>
      
      {/* Webhook configuration UI is removed as it's hardcoded */}

      {finalScore !== null && (
        <div className="my-6 p-4 bg-sky-500 text-white rounded-lg text-center shadow">
          <p className="text-lg font-medium">Nota Final Calculada:</p>
          <p className="text-4xl font-bold">{finalScore.toFixed(2)}%</p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-200">{error}</p>}
      {successMessage && <p className="mt-4 text-sm text-green-700 bg-green-100 p-3 rounded-md border border-green-200">{successMessage}</p>}

      <button
        onClick={onSubmit}
        disabled={isSubmitting} // Changed: Button is only disabled during submission.
        className="mt-6 w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Enviando...' : (finalScore === null ? 'Calcular Nota e Validar' : 'Enviar Avaliação')}
      </button>
       {/* Message about configuring webhook is removed */}
    </div>
  );
};

export default SubmitSection;