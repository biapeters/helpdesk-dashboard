import { supabase } from '../supabaseClient'
 
const BASE_URL = import.meta.env.VITE_N8N_URL
 
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
 
  if (!session?.access_token) {
    throw new Error('Sessão expirada. Faça login novamente.')
  }
 
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  }
}
 
/**
 * Envia uma mensagem via WhatsApp pelo n8n
 */
export async function enviarMensagemWebhook({ telefone, mensagem, idConversa }) {
  const headers = await getAuthHeaders()
 
  const res = await fetch(`${BASE_URL}/enviar-atendente`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ telefone, mensagem, idConversa }),
  })
 
  if (!res.ok) {
    const texto = await res.text().catch(() => '')
    throw new Error(`Erro ao enviar mensagem (${res.status}): ${texto}`)
  }
 
  return res.json().catch(() => ({}))
}
 
/**
 * Cria um novo usuário via n8n (admin only)
 */
export async function criarUsuarioWebhook(form) {
  const headers = await getAuthHeaders()
 
  const res = await fetch(`${BASE_URL}/criar-usuario`, {
    method: 'POST',
    headers,
    body: JSON.stringify(form),
  })
 
  if (!res.ok) {
    throw new Error(`Erro ao criar usuário (${res.status})`)
  }
 
  return res.json().catch(() => ({}))
}
 
/**
 * Exclui um usuário via n8n (admin only)
 */
export async function excluirUsuarioWebhook(userId) {
  const headers = await getAuthHeaders()
 
  const res = await fetch(`${BASE_URL}/excluir-usuario`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId }),
  })
 
  if (!res.ok) {
    throw new Error(`Erro ao excluir usuário (${res.status})`)
  }
 
  return res.json().catch(() => ({}))
}