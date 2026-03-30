import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { criarUsuarioWebhook, excluirUsuarioWebhook } from '../utils/api'
import { STATUS_CFG } from '../constants/statusConfig'

export default function GerenciarUsuarios({ voltar, tema, sessionUserId, usuariosOnline = [], th }) {
  const [usuarios, setUsuarios]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [criando, setCriando]         = useState(false)
  const [excluindoId, setExcluindoId] = useState(null)
  const [form, setForm]               = useState({ nome: '', email: '', senha: '', role: 'atendente' })
  const [msg, setMsg]                 = useState({ tipo: '', texto: '' })

  useEffect(() => { fetchUsuarios() }, [])

  async function fetchUsuarios() {
    const { data } = await supabase.from('perfis').select('*').order('nome')
    if (data) setUsuarios(data)
    setLoading(false)
  }

  async function criarUsuario(e) {
    e.preventDefault()
    setMsg({ tipo: '', texto: '' })

    const dominios = [['@suaempresa.com.br']]
    if (!dominios.some(d => form.email.toLowerCase().endsWith(d))) {
      setMsg({ tipo: 'erro', texto: 'Use um e-mail corporativo.' })
      return
    }
    if (form.senha.length < 8) {
      setMsg({ tipo: 'erro', texto: 'A senha deve ter pelo menos 8 caracteres.' })
      return
    }

    setCriando(true)
    try {
      await criarUsuarioWebhook(form)
      setMsg({ tipo: 'ok', texto: `Usuário ${form.email} criado!` })
      setForm({ nome: '', email: '', senha: '', role: 'atendente' })
      fetchUsuarios()
    } catch (err) {
      console.error('Erro ao criar usuário:', err)
      setMsg({ tipo: 'erro', texto: err.message || 'Erro ao criar usuário.' })
    }
    setCriando(false)
  }

  async function excluirUsuario(usuario) {
    if (!confirm(`Excluir a conta de ${usuario.nome}? Esta ação não pode ser desfeita.`)) return
    setExcluindoId(usuario.id)
    try {
      await excluirUsuarioWebhook(usuario.id)
      fetchUsuarios()
    } catch (err) {
      console.error('Erro ao excluir usuário:', err)
      alert(err.message || 'Erro ao excluir usuário. Tente novamente.')
    }
    setExcluindoId(null)
  }

  const badgeRole = r => r === 'admin'
    ? (tema === 'dark' ? 'bg-violet-900/50 text-violet-300 border-violet-700' : 'bg-violet-100 text-violet-700 border-violet-200')
    : (tema === 'dark' ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200')

  return (
    <div className={`flex h-screen font-sans overflow-hidden ${th.bg}`}>
      <div className="w-full overflow-y-auto p-8 max-w-5xl mx-auto">

        <div className="flex items-center gap-3 mb-8">
          <button onClick={voltar} className={`flex items-center gap-1.5 text-sm font-medium transition ${th.subtext}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <span className={th.muted}>|</span>
          <h1 className={`text-lg font-black ${th.text}`}>Gerenciar Usuários</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* FORM CRIAR */}
          <div className={`lg:col-span-2 rounded-2xl border p-6 ${th.card} ${th.border}`}>
            <h2 className={`font-bold text-xs uppercase tracking-widest mb-5 ${th.subtext}`}>Novo Usuário</h2>
            <form onSubmit={criarUsuario} className="space-y-3">
              {[
                { type: 'text',     placeholder: 'Nome completo',             key: 'nome' },
                { type: 'email',    placeholder: 'email@google.com.br',        key: 'email' },
                { type: 'password', placeholder: 'Senha (min. 8 caracteres)', key: 'senha', min: 8 },
              ].map(f => (
                <input
                  key={f.key}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  minLength={f.min}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-violet-500 text-sm transition ${th.input}`}
                  required
                />
              ))}
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-violet-500 text-sm transition ${th.input}`}
              >
                <option value="atendente">Atendente</option>
                <option value="admin">Admin</option>
              </select>
              {msg.texto && (
                <p className={`text-xs ${msg.tipo === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{msg.texto}</p>
              )}
              <button type="submit" disabled={criando}
                className={`w-full py-2.5 rounded-xl font-bold transition disabled:opacity-40 text-sm ${th.btnPrimary}`}>
                {criando ? 'Criando...' : 'Criar Usuário'}
              </button>
            </form>
          </div>

          {/* LISTA */}
          <div className={`lg:col-span-3 rounded-2xl border p-6 ${th.card} ${th.border}`}>
            <h2 className={`font-bold text-xs uppercase tracking-widest mb-5 ${th.subtext}`}>
              Cadastrados <span className={th.accentText}>({usuarios.length})</span>
            </h2>
            {loading ? (
              <p className={`text-sm ${th.muted}`}>Carregando...</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {usuarios.map(u => {
                  const isOnline    = usuariosOnline.includes(u.id)
                  const stU         = isOnline ? (STATUS_CFG[u.status_atendente] || STATUS_CFG.disponivel) : STATUS_CFG.offline
                  const isSelf      = u.id === sessionUserId
                  const isExcluindo = excluindoId === u.id

                  return (
                    <div key={u.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition
                        ${tema === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'}
                        ${isExcluindo ? 'opacity-50' : ''}`}>

                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${th.avatar}`}>
                            {u.nome?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2
                            ${tema === 'dark' ? 'border-slate-800' : 'border-white'} ${stU.dot}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`font-semibold text-sm truncate ${th.text}`}>{u.nome}</p>
                            {isSelf && (
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border flex-shrink-0
                                ${tema === 'dark' ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-300'}`}>
                                você
                              </span>
                            )}
                          </div>
                          <p className={`text-[10px] truncate ${th.muted}`}>{u.email || '—'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider border ${badgeRole(u.funcao)}`}>
                          {u.funcao}
                        </span>
                        {!isSelf && (
                          <button
                            onClick={() => excluirUsuario(u)}
                            disabled={isExcluindo}
                            title={`Excluir ${u.nome}`}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg transition disabled:opacity-40
                              ${tema === 'dark'
                                ? 'text-slate-600 hover:text-red-400 hover:bg-red-950/30'
                                : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                          >
                            {isExcluindo ? (
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}