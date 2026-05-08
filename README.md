# NexusFlow Pro | Gestão SaaS Premium

Este é o repositório oficial do **NexusFlow Pro**, uma solução SaaS completa para gestão de clientes, contratos e faturamento recorrente.

## 🚀 Como subir para o seu GitHub (Correção de Erros)

Se você recebeu o erro `remote origin already exists`, pule para o passo 3. Se o erro foi `[rejected] main -> main`, use o passo 6.

1.  **Inicie o Git**:
    `git init`

2.  **Adicione o repositório remoto** (Se der erro aqui, pode ignorar e seguir):
    `git remote add origin https://github.com/jonhgestormtk-dev/nexusflowpro.git`

3.  **Prepare os arquivos**:
    `git add .`

4.  **Faça o commit**:
    `git commit -m "feat: setup inicial do NexusFlow Pro"`

5.  **Defina a branch principal**:
    `git branch -M main`

6.  **Envie o código (Forçando o envio para resolver o erro 'rejected')**:
    Use este comando para substituir os arquivos do GitHub pelo seu código local:
    `git push -u origin main --force`

---

## 🛠️ Tecnologias Principais

- **Framework**: Next.js 15 (App Router)
- **Backend**: Firebase (Auth & Firestore)
- **AI**: Google Genkit (Gemini 2.5 Flash)
- **UI**: Tailwind CSS + ShadCN UI
- **Ícones**: Lucide React

## 📱 Funcionalidades Implementadas

- **Dashboard Inteligente**: Métricas de MRR e inadimplência em tempo real com gráficos Recharts.
- **Gestão de Contratos**: Extração automática de dados via IA a partir de PDFs usando Genkit.
- **Faturamento Automatizado**: Geração de faturas recorrentes e controle de numeração sequencial.
- **Comunicação de Cobrança**: Envio formal de débitos via WhatsApp e E-mail com instruções de pagamento.
- **CRM / Pipeline**: Gestão de leads com conversão automática para clientes.
- **Segurança**: Exclusão de dados sensíveis protegida por senha de administrador (`admin123`).
- **Identidade Visual**: Personalização de logotipo e dados da empresa nas configurações.

---
*Este projeto foi prototipado no Firebase Studio.*
