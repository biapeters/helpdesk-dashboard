import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { useNotificacoes } from '../hooks/useNotificacoes'
import { enviarMensagemWebhook } from '../utils/api'
import { useTick } from '../hooks/useTick'
import { getTheme } from '../constants/themes'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import Configuracoes from './Configuracoes'
import PainelAtendentes from './PainelAtendentes'
import GerenciarUsuarios from './GerenciarUsuarios'

export default function MainPanel({ session, perfil, isAdmin }) {
  // ── Conversas ─────────────────────────────────────────
  const [conversas, setConversas]         = useState([])
  const [mensagens, setMensagens]         = useState([])
  const [chatAberto, setChatAberto]       = useState(null)
  const [loading, setLoading]             = useState(true)

  // ── Resposta ──────────────────────────────────────────
  const [textoResposta, setTextoResposta] = useState('')

  // ── Filtros e busca ───────────────────────────────────
  const [abaAtiva, setAbaAtiva]           = useState(isAdmin ? 'todas' : 'aguardando')
  const [busca, setBusca]                 = useState('')
  const [tipoFiltro, setTipoFiltro]       = useState('nome')
  const [filtroData, setFiltroData]       = useState('')

  // ── UI ────────────────────────────────────────────────
  const [somAtivo, setSomAtivo]           = useState(true)
  const [tema, setTema]       = useState(perfil.tema || 'dark')
  const [corTema, setCorTema] = useState(perfil.cor_tema || 'roxo')
  const th = getTheme(tema, corTema)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showFiltroMenu, setShowFiltroMenu]   = useState(false)
  const [pagina, setPagina]               = useState('conversas')

  // ── Perfil local ────
  const [perfilLocal, setPerfilLocal]     = useState(perfil)
  const [statusAtendente, setStatusAtendente] = useState(perfil.status_atendente || 'disponivel')

  // ── Admin: seleção e exclusão de conversas ────────────
  const [selecionadas, setSelecionadas]   = useState([])
  const [deletando, setDeletando]         = useState(false)
  
  // ── Presença ──────────────────────────────────────────
  const [usuariosOnline, setUsuariosOnline] = useState([])
  const mensagensEndRef = useRef(null)
  const primeiroRender = useRef(true)

  useEffect(() => {
    if (!primeiroRender.current) {
      supabase.from('perfis')
        .update({ tema, cor_tema: corTema })
        .eq('id', session.user.id)
    }
    primeiroRender.current = false
  }, [tema, corTema])

  useTick()
  useNotificacoes(conversas, somAtivo)

  // ── Scroll automático ────────────────────────────────
  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  // ── Presença global ───────────────────────────────────
  useEffect(() => {
    const canal = supabase.channel('presenca-global')
    canal.on('presence', { event: 'sync' }, () => {
      const estado = canal.presenceState()
      const ids = Object.values(estado).flatMap(users => users.map(u => u.userId))
      setUsuariosOnline(ids)
    })
    canal.subscribe(async status => {
      if (status === 'SUBSCRIBED') await canal.track({ userId: session.user.id })
    })
    return () => supabase.removeChannel(canal)
  }, [])

  // ── Conversas: fetch + realtime ───────────────────────
  useEffect(() => {
    fetchConversas()
    const canal = supabase.channel('main-conversas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversas' }, fetchConversas)
      .subscribe()
    return () => supabase.removeChannel(canal)
  }, [])

  // ── Mensagens: fetch + realtime ───────────────────────
  useEffect(() => {
    if (!chatAberto) { setMensagens([]); return }
    fetchMensagens(chatAberto.id)
    
    const canal = supabase.channel(`msgs-${chatAberto.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'mensagens',
        filter: `conversa_id=eq.${chatAberto.id}`,
      }, payload => {
        setMensagens(prev => {
          const jaExiste = prev.some(msg => msg.id === payload.new.id);
          if (jaExiste) return prev;
          return [...prev, payload.new];
        });
      })
      .subscribe()
      
    return () => supabase.removeChannel(canal)
  }, [chatAberto?.id])

  // ── Sync chatAberto quando conversas atualizam ────────
  useEffect(() => {
    if (chatAberto) {
      const atualizada = conversas.find(c => c.id === chatAberto.id)
      if (atualizada) setChatAberto(atualizada)
    }
  }, [conversas])

  // ── Funções de dados ──────────────────────────────────
  async function fetchConversas() {
    const { data } = await supabase.from('conversas').select('*').order('criado_em', { ascending: false })
    if (data) setConversas(data)
    setLoading(false)
  }

  async function fetchMensagens(id) {
    const { data } = await supabase.from('mensagens').select('*').eq('conversa_id', id).order('criado_em', { ascending: true })
    if (data) setMensagens(data)
  }

  // ── Ações do atendente ────────────────────────────────
  async function atualizarStatus(novoStatus) {
    setStatusAtendente(novoStatus)
    setShowProfileMenu(false)
    await supabase.from('perfis').update({ status_atendente: novoStatus }).eq('id', session.user.id)
  }

  async function assumirChat() {
    if (!chatAberto) return;
    setChatAberto(prev => ({
      ...prev,
      status: 'em_atendimento',
      atendente_id: session.user.id
    }));

    setAbaAtiva(isAdmin ? 'em_atendimento' : 'meus');

    const { error } = await supabase
      .from('conversas')
      .update({ status: 'em_atendimento', atendente_id: session.user.id })
      .eq('id', chatAberto.id);

    if (error) {
      console.error('Erro do Supabase ao assumir chat:', error);
      alert('Erro ao assumir o atendimento. Verifique o console ou as permissões do banco.');
    }
  }

  async function finalizarChat() {
    if (!chatAberto || !confirm('Finalizar este atendimento?')) return

    const idConversa = chatAberto.id

    setChatAberto(null)
    setConversas(prev => prev.map(c =>
      c.id === idConversa ? { ...c, status: 'finalizado' } : c
    ))

    const { error } = await supabase
      .from('conversas')
      .update({ 
        status: 'finalizado', 
        atendente_id: null 
      })
      .eq('id', idConversa)

    if (error) {
      console.error('Erro ao finalizar conversa no banco:', error)
      alert('Houve um erro ao salvar no banco, mas a visualização foi atualizada.')
    }
  }

  async function enviarMensagem() {
    if (!textoResposta.trim() || !chatAberto) return;
    const texto = textoResposta;
    
    setTextoResposta('');

    const { error } = await supabase
      .from('mensagens')
      .insert({
        conversa_id: chatAberto.id,
        remetente_tipo: 'atendente', 
        conteudo: texto,
      });

    if (error) {
      console.error('Erro ao salvar mensagem no banco:', error);
      alert('Erro ao salvar a mensagem. Verifique a conexão.');
      return;
    }

    try {
      await enviarMensagemWebhook({ 
        telefone: chatAberto.telefone_cliente, 
        mensagem: texto, 
        idConversa: chatAberto.id 
      });
    } catch (err) {
      console.error('Erro no webhook ao enviar para o cliente:', err);
    }
  }

  // ── Filtros ───────────────────────────────────────────
  const filtroStatus = {
    todas:          () => true,
    aguardando:     c => c.status === 'aguardando',
    em_atendimento: c => c.status === 'em_atendimento',
    finalizado:     c => c.status === 'finalizado',
    meus:           c => c.status === 'em_atendimento' && c.atendente_id === session.user.id,
  }

  const conversasFiltradas = conversas
    .filter(filtroStatus[abaAtiva] || (() => true))
    .filter(c => !filtroData || new Date(c.criado_em).toISOString().slice(0, 10) === filtroData)
    .filter(c => {
      if (!busca) return true
      if (tipoFiltro === 'telefone') return (c.telefone_cliente || '').includes(busca)
      return (c.nome_cliente || '').toLowerCase().includes(busca.toLowerCase())
    })

  // ── Seleção em lote ───────────────────────────────────
  const toggleSelecionada     = id => setSelecionadas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleSelecionarTodas = () => setSelecionadas(selecionadas.length === conversasFiltradas.length ? [] : conversasFiltradas.map(c => c.id))

  async function excluirSelecionadas() {
    if (!selecionadas.length || !confirm(`Excluir ${selecionadas.length} conversa(s)?`)) return
    setDeletando(true)
    await supabase.from('mensagens').delete().in('conversa_id', selecionadas)
    await supabase.from('conversas').delete().in('id', selecionadas)
    setSelecionadas([])
    if (chatAberto && selecionadas.includes(chatAberto.id)) setChatAberto(null)
    setDeletando(false)
  }

  // ── Sub-páginas ───────────────────────────────────────
  if (pagina === 'configuracoes') return (
    <Configuracoes
      voltar={() => setPagina('conversas')}
      tema={tema} 
      setTema={setTema}
      corTema={corTema} 
      setCorTema={setCorTema}
      th={th} 
      perfil={perfilLocal}
      onNomeAtualizado={novoNome => setPerfilLocal(p => ({ ...p, nome: novoNome }))}
    />
  )
  if (pagina === 'usuarios') return (
    <GerenciarUsuarios
      voltar={() => setPagina('conversas')}
      tema={tema}
      sessionUserId={session.user.id}
      usuariosOnline={usuariosOnline}
      th={th}
    />
  )
  if (pagina === 'atendentes') return (
    <PainelAtendentes
      voltar={() => setPagina('conversas')}
      tema={tema}
      usuariosOnline={usuariosOnline}
      th={th}
    />
  )

  // ── Derivados para a Sidebar ──────────────────────────
  const abas = isAdmin
    ? [{ id: 'todas', label: 'Todas' }, { id: 'aguardando', label: 'Aguardando' }, { id: 'em_atendimento', label: 'Em Atend.' }, { id: 'finalizado', label: 'Finalizadas' }]
    : [{ id: 'aguardando', label: 'Aguardando' }, { id: 'meus', label: 'Meus Chats' }, { id: 'finalizado', label: 'Finalizadas' }]

  const modoSelecao       = isAdmin && abaAtiva === 'todas'
  const todasSelecionadas = selecionadas.length > 0 && selecionadas.length === conversasFiltradas.length

  // ── Render ────────────────────────────────────────────
  return (
    <div className={`flex h-screen font-sans overflow-hidden ${th.bg}`}>

      <Sidebar
        th={th} tema={tema}
        perfilLocal={perfilLocal}
        perfilNome={perfilLocal?.nome || ''}
        isAdmin={isAdmin}
        session={session}
        statusAtendente={statusAtendente}
        atualizarStatus={atualizarStatus}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        setPagina={setPagina}
        abas={abas}
        abaAtiva={abaAtiva}
        setAbaAtiva={id => { setAbaAtiva(id); setChatAberto(null); setSelecionadas([]) }}
        busca={busca} setBusca={setBusca}
        tipoFiltro={tipoFiltro} setTipoFiltro={setTipoFiltro}
        filtroData={filtroData} setFiltroData={setFiltroData}
        showFiltroMenu={showFiltroMenu} setShowFiltroMenu={setShowFiltroMenu}
        conversasFiltradas={conversasFiltradas}
        chatAberto={chatAberto} setChatAberto={setChatAberto}
        loading={loading}
        modoSelecao={modoSelecao}
        selecionadas={selecionadas}
        todasSelecionadas={todasSelecionadas}
        toggleSelecionada={toggleSelecionada}
        toggleSelecionarTodas={toggleSelecionarTodas}
        excluirSelecionadas={excluirSelecionadas}
        deletando={deletando}
      />

      {/* ── ÁREA PRINCIPAL ──────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOPBAR */}
        <div className={`h-12 flex items-center justify-between px-5 border-b flex-shrink-0 ${th.topbar} ${th.border}`}>
          {/* LOGO */}
          <img
            src="coloquesualogo/"
            alt="logo"
            className="h-7 w-auto object-contain select-none"
            draggable={false}
          />

          <div className="flex items-center gap-2">
            {/* SINO */}
            <button
              onClick={() => setSomAtivo(v => !v)}
              title={somAtivo ? 'Notificação sonora ativa' : 'Notificação sonora muda'}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border transition ${
                somAtivo
                  ? (tema === 'dark' ? `border-slate-700 ${th.accentText} bg-white/5` : `border-slate-200 ${th.accentText} bg-white`)
                  : (tema === 'dark' ? 'border-slate-700 text-slate-600' : 'border-slate-200 text-slate-400')
              }`}
            >
              {somAtivo ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>

            {/* TEMA */}
            <button
              onClick={() => setTema(t => t === 'dark' ? 'light' : 'dark')}
              title="Alternar tema"
              className={`w-8 h-8 flex items-center justify-center rounded-lg border transition ${
                tema === 'dark'
                  ? 'border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  : 'border-slate-200 text-slate-500 hover:text-slate-700'
              }`}
            >
              {tema === 'dark' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <ChatArea
          chatAberto={chatAberto} mensagens={mensagens}
          textoResposta={textoResposta} setTextoResposta={setTextoResposta}
          enviarMensagem={enviarMensagem} assumirChat={assumirChat} finalizarChat={finalizarChat}
          mensagensEndRef={mensagensEndRef} sessionUserId={session.user.id}
          isAdmin={isAdmin} onTransferir={fetchConversas} th={th} tema={tema}
        />
      </div>

      {/* Fecha menus ao clicar fora */}
      {(showProfileMenu || showFiltroMenu) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowProfileMenu(false); setShowFiltroMenu(false) }} />
      )}
    </div>
  )
}