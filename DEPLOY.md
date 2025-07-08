# Deploy no Render

## Passos para Deploy

### 1. Preparação do Repositório
- Certifique-se de que todos os arquivos estão commitados no Git
- Faça push para o GitHub/GitLab

### 2. Configuração no Render

1. Acesse [render.com](https://render.com) e faça login
2. Clique em "New +" e selecione "Web Service"
3. Conecte seu repositório GitHub/GitLab
4. Selecione o repositório do projeto

### 3. Configurações do Serviço

**Nome:** `checklist-qualidade-suporte-b2b` (ou o nome que preferir)

**Environment:** `Docker`

**Region:** Escolha a região mais próxima (ex: Oregon, Frankfurt)

**Branch:** `main` (ou sua branch principal)

**Root Directory:** Deixe em branco (se o projeto estiver na raiz)

### 4. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Render:

- `NODE_ENV`: `production`
- `VITE_ZENDESK_SUBDOMAIN`: Seu subdomínio do Zendesk
- `VITE_ZENDESK_EMAIL`: Seu email do Zendesk
- `VITE_ZENDESK_API_TOKEN`: Seu token de API do Zendesk
- `VITE_WEBHOOK_URL`: URL do webhook (se aplicável)

### 5. Configurações Avançadas

**Build Command:** Deixe em branco (usará o Dockerfile)

**Start Command:** Deixe em branco (usará o CMD do Dockerfile)

**Health Check Path:** `/`

### 6. Deploy

1. Clique em "Create Web Service"
2. O Render irá automaticamente:
   - Fazer build da imagem Docker
   - Deployar a aplicação
   - Fornecer uma URL pública

### 7. Verificação

Após o deploy, acesse a URL fornecida pelo Render para verificar se a aplicação está funcionando corretamente.

## Troubleshooting

### Problemas Comuns

1. **Build falha:**
   - Verifique se todas as dependências estão no `package.json`
   - Confirme se o Dockerfile está correto

2. **Aplicação não inicia:**
   - Verifique os logs no Render Dashboard
   - Confirme se as variáveis de ambiente estão configuradas

3. **Erro de CORS:**
   - O servidor já está configurado com CORS
   - Verifique se as URLs estão corretas

### Logs

Para ver os logs da aplicação:
1. Vá para o Dashboard do Render
2. Selecione seu serviço
3. Clique na aba "Logs"

## Estrutura do Projeto

- `Dockerfile`: Configuração do container
- `.dockerignore`: Arquivos excluídos do container
- `render.yaml`: Configuração opcional do Render
- `zendesk-proxy.js`: Servidor Express
- `package.json`: Dependências e scripts