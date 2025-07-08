import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const webhookUrl = process.env.VITE_MAKE_WEBHOOK_URL;
  try {
    const response = await axios.post(webhookUrl, req.body, {
      headers: { 'Content-Type': 'application/json' }
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
