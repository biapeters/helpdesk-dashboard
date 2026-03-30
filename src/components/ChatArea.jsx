import { useState } from 'react'
import ModalTransferir from './ModalTransferir'

export default function ChatArea({
  chatAberto, mensagens, textoResposta, setTextoResposta,
  enviarMensagem, assumirChat, finalizarChat,
  mensagensEndRef, sessionUserId, isAdmin, onTransferir, th, tema,
}) {
  const [showTransferir, setShowTransferir] = useState(false)

  if (!chatAberto) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center ${th.bg}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${tema === 'dark' ? 'bg-slate-900' : 'bg-slate-200'}`}>
          <svg className={`w-7 h-7 ${th.muted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className={`font-semibold text-sm ${th.subtext}`}>Selecione uma conversa</p>
        <p className={`text-xs mt-1 ${th.muted}`}>para visualizar o histórico</p>
      </div>
    )
  }

  const podeResponder = isAdmin || (chatAberto.status === 'em_atendimento' && chatAberto.atendente_id === sessionUserId)
  const podeTransferir = chatAberto.status === 'em_atendimento' && (isAdmin || chatAberto.atendente_id === sessionUserId)
  const STATUS_LABEL = { aguardando: '• FILA DE ESPERA', em_atendimento: '• EM ATENDIMENTO', finalizado: '• FINALIZADO' }
  const STATUS_COLOR = { aguardando: 'text-amber-400', em_atendimento: 'text-emerald-400', finalizado: th.muted }

  return (
    <>
      <div className={`flex-1 flex flex-col overflow-hidden ${th.bg}`}>
        {/* HEADER */}
        <div className={`px-6 py-3 flex items-center justify-between border-b flex-shrink-0 ${th.header} ${th.border}`}>
          <div>
            <h2 className={`font-bold text-sm ${th.text}`}>{chatAberto.nome_cliente || chatAberto.telefone_cliente}</h2>
            <p className={`text-[10px] ${th.muted}`}>{chatAberto.telefone_cliente}</p>
            <p className={`text-[9px] font-black mt-0.5 ${STATUS_COLOR[chatAberto.status] || th.muted}`}>
              {STATUS_LABEL[chatAberto.status] || chatAberto.status}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {podeTransferir && (
              <button
                onClick={() => setShowTransferir(true)}
                className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition uppercase tracking-wide ${th.btnSecondary}`}
              >
                ↗ Transferir
              </button>
            )}
            {chatAberto.status === 'em_atendimento' && (isAdmin || chatAberto.atendente_id === sessionUserId) && (
              <button
                onClick={finalizarChat}
                className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition uppercase tracking-wide ${th.btnDanger}`}
              >
                ✓ Resolver
              </button>
            )}
          </div>
        </div>

        {/* MENSAGENS */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3 flex flex-col">
          {mensagens.length === 0 ? (
            <div className="flex justify-center mt-4">
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${tema === 'dark' ? 'text-slate-600 bg-slate-900 border-slate-800' : 'text-slate-400 bg-slate-100 border-slate-200'}`}>
                Início da Conversa
              </span>
            </div>
          ) : (
            mensagens.map(msg => {
              const isAtendente = msg.remetente_tipo === 'atendente'
              const isIA = msg.remetente_tipo === 'ia'
              const isSistema = msg.remetente_tipo === 'sistema'

              if (isSistema) return (
                <div key={msg.id} className="flex justify-center">
                  <span className={`text-[10px] italic px-3 py-1.5 rounded-full border max-w-xs text-center ${tema === 'dark' ? 'text-slate-500 bg-slate-900/60 border-slate-800' : 'text-slate-400 bg-slate-100 border-slate-200'}`}>
                    {msg.conteudo}
                  </span>
                </div>
              )

              return (
                <div key={msg.id} className={`flex w-full ${isAtendente ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-sm lg:max-w-md shadow-sm ${
                    isAtendente ? `${th.msgAtd} rounded-tr-sm` :
                    isIA       ? `${th.msgIA} rounded-tl-sm` :
                                 `${th.msgClient} rounded-tl-sm`
                  }`}>
                    {isIA && (
                      <span className="text-[9px] font-black text-violet-400 block mb-1 uppercase tracking-wider">
                        🤖 Assistente IA
                      </span>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.conteudo}</p>
                    <span className="text-[9px] opacity-50 block mt-1 text-right">
                      {new Date(msg.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={mensagensEndRef} />
        </div>

        {/* INPUT */}
        <div className={`px-5 py-4 border-t flex-shrink-0 ${th.header} ${th.border}`}>
          {chatAberto.status === 'aguardando' && !isAdmin ? (
            <button
              onClick={assumirChat}
              className={`w-full py-3 rounded-xl font-black uppercase text-sm tracking-wider transition shadow-lg ${th.btnPrimary}`}
            >
              Assumir este Atendimento
            </button>
          ) : chatAberto.status === 'finalizado' ? (
            <p className={`text-center text-sm italic py-1 ${th.muted}`}>Atendimento finalizado.</p>
          ) : !podeResponder ? (
            <p className={`text-center text-sm italic py-1 ${th.muted}`}>Este chat está com outro atendente.</p>
          ) : (
            <div className="flex gap-3 items-end">
              <textarea
                value={textoResposta}
                onChange={e => setTextoResposta(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensagem() } }}
                placeholder="Escreva sua mensagem... (Enter para enviar)"
                rows={2}
                className={`flex-1 px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none transition ${th.input}`}
              />
              <button
                onClick={enviarMensagem}
                className={`p-3 rounded-xl transition shadow-md flex-shrink-0 ${th.btnPrimary}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {showTransferir && (
        <ModalTransferir
          chatAberto={chatAberto}
          onClose={() => setShowTransferir(false)}
          onTransferir={onTransferir}
          th={th}
          tema={tema}
        />
      )}
    </>
  )
}