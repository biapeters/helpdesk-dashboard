import { supabase } from '../supabaseClient'
import { STATUS_CFG } from '../constants/statusConfig'
import { formatarData, formatarHora, tempoEspera } from '../utils/helpers'

const STATUS_CONV = {
  aguardando:     { dot: 'bg-amber-400',  label: 'Aguardando' },
  em_atendimento: { dot: 'bg-emerald-400', label: 'Em Atend.' },
  finalizado:     { dot: 'bg-slate-500',  label: 'Finalizado' },
}

export default function Sidebar({
  // Tema
  th, tema,
  // Perfil
  perfilLocal, perfilNome, isAdmin, sessionEmail,
  statusAtendente, atualizarStatus,
  showProfileMenu, setShowProfileMenu,
  // Navegação
  setPagina,
  // Abas
  abas, abaAtiva, setAbaAtiva,
  // Busca e filtro
  busca, setBusca,
  tipoFiltro, setTipoFiltro,
  filtroData, setFiltroData,
  showFiltroMenu, setShowFiltroMenu,
  // Conversas
  conversasFiltradas, chatAberto, setChatAberto, loading,
  // Seleção admin
  modoSelecao, selecionadas, todasSelecionadas,
  toggleSelecionada, toggleSelecionarTodas,
  excluirSelecionadas, deletando,
}) {
  const stAtd = STATUS_CFG[statusAtendente] || STATUS_CFG.disponivel
  const STATUS_CONV = {
    aguardando:     { dot: 'bg-amber-400',  label: 'Aguardando' },
    em_atendimento: { dot: 'bg-emerald-400', label: 'Em Atend.' },
    finalizado:     { dot: 'bg-slate-500',  label: 'Finalizado' },
  }

  return (
   <div className={`w-72 flex flex-col flex-shrink-0 border-r relative z-50 ${th.sidebar} ${th.border}`}>
      <div className={`px-4 pt-4 pb-3 border-b ${th.border} space-y-3`}>

        {/* ── PERFIL ─────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 relative">
            <div className="relative cursor-pointer" onClick={() => setShowProfileMenu(v => !v)}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow ${th.avatar}`}>
                {perfilLocal?.nome?.substring(0, 2).toUpperCase() || 'SK'}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${tema === 'dark' ? 'border-slate-900' : 'border-white'} ${stAtd.dot}`} />

              {/* MENU DO PERFIL */}
              {showProfileMenu && (
                <div
                  className={`absolute top-11 left-0 z-50 w-56 rounded-2xl border shadow-2xl overflow-hidden ${th.modalBg}`}
                  onClick={e => e.stopPropagation()}
                >
                  {/* INFO */}
                  <div className={`px-4 py-3 border-b ${th.border}`}>
                    <p className={`font-bold text-sm ${th.text}`}>{perfilNome}</p>
                    <p className={`text-[10px] ${th.muted}`}>{perfilLocal?.email || sessionEmail}</p>
                  </div>

                  {/* STATUS */}
                  <div className={`px-3 py-2 border-b ${th.border}`}>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${th.muted}`}>Meu Status</p>
                    {Object.entries(STATUS_CFG)
                      .filter(([key]) => key !== 'offline') // offline é automático, não manual
                      .map(([key, cfg]) => (
                        <button key={key} onClick={() => atualizarStatus(key)}
                          className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left transition ${th.cardHover}
                            ${statusAtendente === key ? (tema === 'dark' ? 'bg-slate-800' : 'bg-slate-100') : ''}`}>
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <span className={`text-sm font-semibold ${th.text}`}>{cfg.label}</span>
                          {statusAtendente === key && <span className="ml-auto text-violet-500 text-xs">✓</span>}
                        </button>
                      ))}
                  </div>

                  {/* STATUS DA EQUIPE — todos */}
                  <div className={`border-b ${th.border}`}>
                    <button onClick={() => { setPagina('atendentes'); setShowProfileMenu(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${th.cardHover}`}>
                      <svg className={`w-4 h-4 flex-shrink-0 ${th.subtext}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className={`text-sm font-semibold ${th.text}`}>Status da equipe</span>
                    </button>
                  </div>

                  {/* GERENCIAR USUÁRIOS — só admin */}
                  {isAdmin && (
                    <div className={`border-b ${th.border}`}>
                      <button onClick={() => { setPagina('usuarios'); setShowProfileMenu(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${th.cardHover}`}>
                        <svg className={`w-4 h-4 flex-shrink-0 ${th.subtext}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className={`text-sm font-semibold ${th.text}`}>Gerenciar usuários</span>
                      </button>
                    </div>
                  )}

                  {/* CONFIGURAÇÕES */}
                  <div className={`border-b ${th.border}`}>
                    <button onClick={() => { setPagina('configuracoes'); setShowProfileMenu(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${th.cardHover}`}>
                      <svg className={`w-4 h-4 flex-shrink-0 ${th.subtext}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className={`text-sm font-semibold ${th.text}`}>Configurações</span>
                    </button>
                  </div>

                  {/* SAIR */}
                  <button onClick={() => supabase.auth.signOut()}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${tema === 'dark' ? 'hover:bg-red-950/40 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-semibold">Sair</span>
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-bold text-sm truncate max-w-[110px] ${th.text}`}>{perfilNome || 'Atendente'}</span>
                {isAdmin && (
                  <span className="text-[8px] bg-violet-900/60 text-violet-300 border border-violet-700 px-1.5 py-0.5 rounded-full font-black uppercase">
                    Admin
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold ${stAtd.text}`}>{stAtd.label}</span>
            </div>
          </div>
        </div>

        {/* ── ABAS ───────────────────────────────────── */}
        <div className={`grid gap-1 p-1 rounded-xl ${th.tabBg}`}
          style={{ gridTemplateColumns: `repeat(${abas.length}, 1fr)` }}>
          {abas.map(aba => (
            <button key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`text-[10px] font-bold py-2 rounded-lg transition ${abaAtiva === aba.id ? th.tabActive : th.tabInactive}`}>
              {aba.label}
            </button>
          ))}
        </div>

        {/* ── BUSCA + FILTRO ─────────────────────────── */}
        <div className="flex gap-2 items-center">
          {tipoFiltro !== 'data' ? (
            <div className="relative flex-1">
              <svg className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${th.muted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder={tipoFiltro === 'nome' ? 'Buscar por nome...' : 'Buscar por telefone...'}
                className={`w-full pl-8 pr-6 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-violet-500 text-[11px] transition ${th.input}`}
              />
              {busca && (
                <button onClick={() => setBusca('')} className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${th.muted} hover:text-red-400`}>✕</button>
              )}
            </div>
          ) : (
            <div className="relative flex-1">
              <input
                type="date"
                value={filtroData}
                onChange={e => setFiltroData(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-violet-500 text-[11px] transition ${th.input}`}
              />
              {filtroData && (
                <button onClick={() => setFiltroData('')} className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${th.muted} hover:text-red-400`}>✕</button>
              )}
            </div>
          )}

          {/* BOTÃO FILTRO */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowFiltroMenu(v => !v)}
              title="Filtros"
              className={`w-8 h-8 flex items-center justify-center rounded-xl border transition
                ${(busca || filtroData)
                  ? (tema === 'dark' ? 'border-violet-700 bg-violet-950/50 text-violet-400' : 'border-violet-300 bg-violet-50 text-violet-600')
                  : (tema === 'dark' ? `border-slate-700 ${th.muted} hover:text-slate-300` : `border-slate-200 ${th.muted} hover:text-slate-600`)}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
            </button>

            {showFiltroMenu && (
              <div
                className={`absolute right-0 top-10 z-50 w-44 rounded-2xl border shadow-2xl overflow-hidden ${th.modalBg}`}
                onClick={e => e.stopPropagation()}
              >
                <p className={`text-[9px] font-black uppercase tracking-widest px-4 pt-3 pb-1.5 ${th.muted}`}>Filtrar por</p>
                {[
                  { id: 'nome',     label: 'Nome' },
                  { id: 'telefone', label: 'Telefone' },
                  { id: 'data',     label: 'Data' },
                ].map(op => (
                  <button key={op.id}
                    onClick={() => { setTipoFiltro(op.id); setBusca(''); setFiltroData(''); setShowFiltroMenu(false) }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition ${th.cardHover}
                      ${tipoFiltro === op.id ? `font-bold ${th.text}` : `font-medium ${th.subtext}`}`}
                  >
                    {op.label}
                    {tipoFiltro === op.id && <span className="text-violet-500 text-xs">✓</span>}
                  </button>
                ))}
                {(busca || filtroData) && (
                  <>
                    <div className={`mx-3 my-1 border-t ${th.border}`} />
                    <button
                      onClick={() => { setBusca(''); setFiltroData(''); setShowFiltroMenu(false) }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition text-red-400 hover:text-red-300 ${th.cardHover}`}
                    >
                      Limpar filtro
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── SELEÇÃO ADMIN ──────────────────────────── */}
        {modoSelecao && (
          <div className={`flex items-center justify-between px-2 py-1.5 rounded-xl border
            ${tema === 'dark' ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={todasSelecionadas} onChange={toggleSelecionarTodas} className={`w-3.5 h-3.5 ${th.checkAccent}`} />
              <span className={`text-[10px] font-medium ${th.subtext}`}>
                {selecionadas.length > 0
                  ? `${selecionadas.length} selecionada${selecionadas.length > 1 ? 's' : ''}`
                  : 'Selecionar todas'}
              </span>
            </label>
            {selecionadas.length > 0 && (
              <button
                onClick={excluirSelecionadas}
                disabled={deletando}
                title="Excluir selecionadas"
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition disabled:opacity-40
                  ${tema === 'dark' ? 'text-slate-500 hover:text-red-400 hover:bg-red-950/30' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
              >
                {deletando ? (
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
        )}
      </div>

      {/* ── LISTA DE CONVERSAS ─────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className={`p-8 text-center text-xs ${th.muted}`}>Carregando...</div>
        ) : conversasFiltradas.length === 0 ? (
          <div className={`p-10 text-center text-sm italic ${th.muted}`}>
            {busca ? 'Nenhum resultado.' : filtroData ? 'Nenhuma conversa nesta data.' : 'Nenhuma conversa.'}
          </div>
        ) : (
          conversasFiltradas.map(conv => {
            const stConv = STATUS_CONV[conv.status] || STATUS_CONV.finalizado
            const ativo = chatAberto?.id === conv.id
            const isSelecionada = selecionadas.includes(conv.id)

            return (
              <div key={conv.id}
                className={`px-3 py-3 border-b cursor-pointer transition flex gap-2 items-start ${th.border}
                  ${ativo ? th.cardActive : th.cardHover}
                  ${isSelecionada ? (tema === 'dark' ? 'bg-red-950/20' : 'bg-red-50') : ''}`}>

                {modoSelecao && (
                  <div className="pt-0.5 flex-shrink-0" onClick={e => { e.stopPropagation(); toggleSelecionada(conv.id) }}>
                    <input type="checkbox" checked={isSelecionada} onChange={() => {}} className={`w-3.5 h-3.5 cursor-pointer ${th.checkAccent}`} />
                  </div>
                )}

                <div className="flex-1 min-w-0" onClick={() => setChatAberto(conv)}>
                  <div className="flex items-start justify-between gap-1">
                    <p className={`font-semibold text-sm truncate ${th.text}`}>{conv.nome_cliente || conv.telefone_cliente}</p>
                    <span className={`text-[9px] flex-shrink-0 font-mono ${th.muted}`}>{formatarData(conv.criado_em)}</span>
                  </div>
                  <p className={`text-[10px] truncate ${th.muted}`}>{conv.telefone_cliente}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${stConv.dot}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${th.muted}`}>{stConv.label}</span>
                    </div>
                    {conv.status === 'aguardando' ? (
                      <span className="text-[9px] font-black text-amber-500 bg-amber-950/40 border border-amber-900/50 px-1.5 py-0.5 rounded-full">
                        ⏱ {tempoEspera(conv.criado_em)}
                      </span>
                    ) : (
                      <span className={`text-[9px] font-mono ${th.muted}`}>{formatarHora(conv.criado_em)}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}