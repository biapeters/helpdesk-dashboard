import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { STATUS_CFG } from '../constants/statusConfig'

export default function PainelAtendentes({ voltar, tema, usuariosOnline = [], th }) {
  const [atendentes, setAtendentes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAtendentes()
    const canal = supabase.channel('atendentes-status-v2')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'perfis' }, payload => {
        setAtendentes(prev => prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'perfis' }, () => fetchAtendentes())
      .subscribe()
    return () => supabase.removeChannel(canal)
  }, [])

  async function fetchAtendentes() {
    const { data } = await supabase.from('perfis').select('*').order('nome')
    if (data) setAtendentes(data)
    setLoading(false)
  }

  return (
    <div className={`flex h-screen font-sans overflow-hidden ${th.bg}`}>
      <div className="w-full overflow-y-auto p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={voltar}
            className={`flex items-center gap-1.5 text-sm font-medium transition ${th.subtext}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <span className={th.muted}>|</span>
          <h1 className={`text-lg font-black ${th.text}`}>Status dos Atendentes</h1>
          <span className={`text-[9px] border px-2 py-0.5 rounded-full ${tema === 'dark' ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-200'}`}>
            Tempo real
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className={`text-sm col-span-3 ${th.muted}`}>Carregando...</p>
          ) : (
            atendentes.map(a => {
              const isOnline = usuariosOnline.includes(a.id)
              const st = isOnline
                ? (STATUS_CFG[a.status_atendente] || STATUS_CFG.disponivel)
                : STATUS_CFG.offline
              return (
                <div key={a.id} className={`rounded-2xl border p-4 flex items-center gap-4 ${th.card} ${th.border}`}>
                  <div className="relative flex-shrink-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm ${th.avatar}`}>
                      {a.nome?.substring(0, 2).toUpperCase()}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${tema === 'dark' ? 'border-slate-900' : 'border-white'} ${st.dot}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-bold text-sm truncate ${th.text}`}>{a.nome}</p>
                    <p className={`text-[10px] truncate ${th.muted}`}>{a.email}</p>
                    <span className={`inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${st.badge}`}>
                      {st.label}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}