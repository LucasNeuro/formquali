import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ZENDESK_SUBDOMAIN = process.env.VITE_ZENDESK_SUBDOMAIN;
const ZENDESK_EMAIL = process.env.VITE_ZENDESK_EMAIL;
const ZENDESK_API_TOKEN = process.env.VITE_ZENDESK_API_TOKEN;

const zendeskApi = axios.create({
  baseURL: `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/`,
  headers: {
    Authorization: `Basic ${Buffer.from(`${ZENDESK_EMAIL}/token:${ZENDESK_API_TOKEN}`).toString('base64')}`,
    'Content-Type': 'application/json',
  },
});

// --- SERVE FRONTEND BUILD (VITE) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viteDistPath = path.join(__dirname, 'dist');
app.use(express.static(viteDistPath));

// Todas as rotas de API devem vir antes do fallback
app.post('/api/ticket', async (req, res) => {
  const { ticketNumber } = req.body;
  if (!ticketNumber) {
    return res.status(400).json({ error: 'ticketNumber é obrigatório' });
  }

  try {
    // Busca o ticket
    const ticketResp = await zendeskApi.get(`tickets/${ticketNumber}.json`);
    const ticket = ticketResp.data.ticket;

    // Busca nome da organização (casa)
    let casa = '';
    if (ticket.organization_id) {
      try {
        const orgResp = await zendeskApi.get(`organizations/${ticket.organization_id}.json`);
        casa = orgResp.data.organization.name;
      } catch (e) {
        casa = '';
      }
    }

    // Busca nome do analista (assignee)
    let analista = '';
    let analistaEmail = '';
    if (ticket.assignee_id) {
      try {
        const userResp = await zendeskApi.get(`users/${ticket.assignee_id}.json`);
        console.log('Assignee userResp:', userResp.data.user);
        analista = userResp.data.user.name;
        analistaEmail = userResp.data.user.email || '';
      } catch (e) {
        console.log('Erro ao buscar assignee:', e?.response?.data || e.message);
        analista = '';
        analistaEmail = '';
      }
    }

    // Busca nome do solicitante (requester)
    let solicitante = '';
    if (ticket.requester_id) {
      try {
        const userResp = await zendeskApi.get(`users/${ticket.requester_id}.json`);
        console.log('Requester userResp:', userResp.data.user);
        solicitante = userResp.data.user.name;
      } catch (e) {
        console.log('Erro ao buscar requester:', e?.response?.data || e.message);
        solicitante = '';
      }
    }

    // Retorna os dados necessários
    res.json({
      id: ticket.id,
      status: ticket.status,
      priority: ticket.priority,
      created_at: ticket.created_at,
      requester_id: ticket.requester_id,
      requester_name: solicitante,
      tags: ticket.tags || [],
      organization_id: ticket.organization_id,
      organization_name: casa,
      assignee_id: ticket.assignee_id,
      assignee_name: analista,
      assignee_email: analistaEmail
    });

  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.post('/api/send-webhook', async (req, res) => {
  const webhookUrl = process.env.VITE_WEBHOOK_URL;
  try {
    const response = await axios.post(webhookUrl, req.body.data, {
      headers: { 'Content-Type': 'application/json' }
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fallback para index.html do Vite para rotas que não sejam API (deve ser o último)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(viteDistPath, 'index.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Zendesk proxy rodando em http://localhost:${PORT}`);
});
