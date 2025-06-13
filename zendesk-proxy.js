import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Zendesk proxy rodando em http://localhost:${PORT}`);
});
