import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { STATUS_CFG } from '../constants/statusConfig'

export default function ModalTransferir({ chatAberto, onClose, onTransferir, th, tema }) {
  const [atendentes, setAtendentes] = useState([])
  const [usuariosOnline, setUsuariosOnline] = useState([])
  const [selecionado, setSelecionado] = useState('')
  const [nota, setNota] = useState('')
  const [loading, setLoading] = useState(false)

  // Carrega lista de atendentes (exceto o atual)
  useEffect(() => {
    supabase.from('perfis').select('*').order('nome').then(({ data }) => {
      if (data) setAtendentes(data.filter(a => a.id !== chatAberto.atendente_id))
    })
  }, [])

  // Presença em tempo real — igual ao MainPanel
  useEffect(() => {
    const canal = supabase.channel('presenca-modal-transferir')
    canal.on('presence', { event: 'sync' }, () => {
      const estado = canal.presenceState()
      const ids = Object.values(estado).flatMap(users => users.map(u => u.userId))
      setUsuariosOnline(ids)
    })
    canal.subscribe()
    return () => supabase.removeChannel(canal)
  }, [])

  const confirmar = async () => {
    if (!selecionado) return
    setLoading(true)
    const atendente = atendentes.find(a => a.id === selecionado)

    await supabase
      .from('conversas')
      .update({ atendente_id: selecionado })
      .eq('id', chatAberto.id)

    // Mensagem de sistema visível no chat 
    await supabase.from('mensagens').insert({
      conversa_id: chatAberto.id,
      remetente_tipo: 'sistema',
      conteudo: `🔄 Transferido para ${atendente?.nome || 'outro atendente'}${nota.trim() ? `\n📝 Nota: "${nota.trim()}"` : '.'}`,
    })

    setLoading(false)
    onTransferir()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${th.modalBg}`}>
        <h3 className={`font-black text-base mb-1 ${th.text}`}>Transferir Atendimento</h3>
        <p className={`text-xs mb-5 ${th.subtext}`}>Escolha um atendente e deixe uma nota opcional.</p>

        <div className="space-y-3">
          {/* LISTA DE ATENDENTES COM PRESENÇA EM TEMPO REAL */}
          <div className={`rounded-xl border overflow-hidden ${tema === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            {atendentes.length === 0 ? (
              <p className={`text-xs text-center py-4 ${th.muted}`}>Nenhum atendente disponível.</p>
            ) : (
              atendentes.map(a => {
                // Usa a presença real, igual ao PainelAtendentes
                const isOnline = usuariosOnline.includes(a.id)
                const st = isOnline
                  ? (STATUS_CFG[a.status_atendente] || STATUS_CFG.disponivel)
                  : STATUS_CFG.offline
                const isSel = selecionado === a.id
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelecionado(a.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition border-b last:border-0 ${th.border}
                      ${isSel ? (tema === 'dark' ? 'bg-violet-950/60' : 'bg-violet-50') : th.cardHover}`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${th.avatar}`}>
                        {a.nome?.substring(0, 2).toUpperCase()}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2
                        ${tema === 'dark' ? 'border-slate-900' : 'border-white'} ${st.dot}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${th.text}`}>{a.nome}</p>
                      <span className={`text-[9px] font-bold ${st.text}`}>{st.label}</span>
                    </div>
                    {isSel && <span className={`text-sm flex-shrink-0 ${th.accentText}`}>✓</span>}
                  </button>
                )
              })
            )}
          </div>

          <textarea
            value={nota}
            onChange={e => setNota(e.target.value)}
            placeholder="Nota para o próximo atendente (opcional)..."
            rows={2}
            className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 text-sm resize-none transition ${th.input} ${th.ring}`}
          />

          <div className="flex gap-2">
            <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${th.btnSecondary}`}>
              Cancelar
            </button>
            <button
              onClick={confirmar}
              disabled={!selecionado || loading}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-40 ${th.btnPrimary}`}
            >
              {loading ? 'Transferindo...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}