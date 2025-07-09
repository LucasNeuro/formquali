import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const geminiApiKey = process.env.VITE_GEMINI_API_KEY;
  const { perguntasRespostasTexto } = req.body;

  if (!geminiApiKey) {
    return res.status(500).json({ error: 'VITE_GEMINI_API_KEY não configurada.' });
  }
  if (!perguntasRespostasTexto) {
    return res.status(400).json({ error: 'Texto de perguntas e respostas não enviado.' });
  }

  // Prompt para o Gemini
  const prompt = `
Organize as respostas abaixo em um JSON onde cada chave é o número da pergunta, e cada valor é um objeto com 'pergunta', 'resposta' e 'justificativa'.
Além disso, gere um campo "avaliacao_ia" com uma avaliação geral do atendimento (máximo 3 linhas) e um campo "sugestao_ia" com uma sugestão de melhoria (máximo 2 linhas).

Respostas:
${perguntasRespostasTexto}
`;

  try {
    const geminiResponse = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiApiKey,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    // O Gemini retorna o JSON como texto, então precisamos fazer o parse
    const text = geminiResponse.data.candidates[0].content.parts[0].text;
    let payloadIA;
    try {
      payloadIA = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao interpretar resposta da IA', raw: text });
    }

    res.json({ success: true, payloadIA });
  } catch (error) {
    // Adiciona logging detalhado do erro
    console.error('Erro na chamada à API Gemini:', error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
} 