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

## 🖥️ Prévia do Sistema

Abaixo você pode conferir algumas das principais telas do painel em ação, destacando a interface intuitiva e as opções de personalização para os atendentes.
### 1. Painel Principal de Atendimento
Visão geral da interface de chat, mostrando a fila de espera, conversas ativas e o status em tempo real.

<img width="1915" height="863" alt="helpdesk" src="https://github.com/user-attachments/assets/9736877f-4921-4153-bf28-2e959bf36d8d" />

### 2. Gerenciamento de Equipe (Admin)
Interface com controle de acesso, permitindo que administradores criem novas contas corporativas e gerenciem os usuários do sistema.

<img width="1912" height="862" alt="helpdesk1" src="https://github.com/user-attachments/assets/b18d72d0-7cb0-4b07-9ce1-d3984676c0e8" />

### 3. Configurações da Conta
Área dedicada à personalização da experiência do usuário, com opções de alteração de credenciais e troca de temas (Modo Claro/Escuro e cores de destaque).

<img width="1912" height="857" alt="helpdesk2" src="https://github.com/user-attachments/assets/8bc99154-d9f8-4d26-98f1-2e4e12cf9cb6" />

---
Made with ❤️ by Bianca Peters
