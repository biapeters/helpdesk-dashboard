# 🎧 Helpdesk Dashboard

Um sistema completo e em tempo real para gestão de atendimentos via WhatsApp, desenvolvido para centralizar conversas, gerenciar o status da equipe e automatizar o suporte ao cliente utilizando Inteligência Artificial.

Este repositório contém o código-fonte do **Frontend** da aplicação. O ecossistema completo foi projetado para ser suportado por um motor de automação (n8n) e um Backend-as-a-Service (Supabase).

---

## 🚀 Funcionalidades Principais

* **Gestão de Chats em Tempo Real:** Fila de espera, atribuição de chats (assumir/transferir) e histórico atualizado instantaneamente via WebSockets.
* **Controle de Acesso e Roles:** Níveis de permissão distintos para *Admins* (gestão de equipe) e *Atendentes* (foco na fila).
* **Temas Personalizáveis:** Alternância entre Modo Claro/Escuro e paleta de cores de destaque.
* **Preparado para IA (Back-end):** Interface pronta para receber transcrição de áudios, leitura de imagens e triage via bot inteligente.

---

## 🧠 Arquitetura do Sistema

O projeto utiliza uma arquitetura *Serverless* e *Low-code*:

1.  **Interface (Frontend):** Construída com React, Vite e Tailwind CSS.
2.  **Backend & Persistência:** Integração nativa com Supabase (PostgreSQL, Auth e Realtime), utilizando Row Level Security (RLS) para proteção de dados.
3.  **Motor de Automação:** Projetado para consumir Webhooks de plataformas como o n8n para orquestrar as mensagens do WhatsApp e processamento de IA.

> **⚠️ Nota:** Por questões de segurança, chaves de API e workflows de automação não estão inclusos. A aplicação demonstra a interface e a lógica de negócios consumindo o Supabase.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React.js, Vite 8, Tailwind CSS 4, Dotenv.
* **Backend:** Supabase.
---

Made with ❤️ by Bianca Peters