import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Configuracoes({ voltar, tema, setTema, corTema, setCorTema, th, perfil, onNomeAtualizado }) {
  const [abaAtiva, setAbaAtiva] = useState('aparencia')

  return (
    <div className={`flex h-screen font-sans overflow-hidden ${th.bg}`}>
      <div className="w-full overflow-y-auto p-8 max-w-2xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={voltar} className={`flex items-center gap-1.5 text-sm font-medium transition ${th.subtext}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <span className={th.muted}>|</span>
          <h1 className={`text-lg font-black ${th.text}`}>Configurações</h1>
        </div>

        {/* CARD PERFIL */}
        <div className={`flex items-center gap-4 p-5 rounded-2xl border mb-6 ${th.card} ${th.border}`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 ${th.avatar}`}>
            {perfil?.nome?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className={`font-bold text-base ${th.text}`}>{perfil?.nome}</p>
            <p className={`text-xs ${th.muted}`}>{perfil?.email || ''}</p>
            <p className={`text-[10px] font-semibold mt-0.5 ${th.accentText}`}>
              {perfil?.funcao === 'admin' ? 'Administrador' : 'Atendente'}
            </p>
          </div>
        </div>

        {/* ABAS */}
        <div className={`flex gap-1 p-1 rounded-xl mb-6 ${th.tabBg}`}>
          {[
            { id: 'aparencia', label: 'Aparência' },
            { id: 'nome',      label: 'Nome' },
            { id: 'senha',     label: 'Senha' },
          ].map(aba => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex-1 text-sm font-bold py-2.5 rounded-lg transition ${abaAtiva === aba.id ? th.tabActive : th.tabInactive}`}
            >
              {aba.label}
            </button>
          ))}
        </div>

        {abaAtiva === 'aparencia' && (
          <FormAparencia th={th} tema={tema} setTema={setTema} corTema={corTema} setCorTema={setCorTema} />
        )}
        {abaAtiva === 'nome' && (
          <FormNome th={th} tema={tema} perfil={perfil} onNomeAtualizado={onNomeAtualizado} />
        )}
        {abaAtiva === 'senha' && (
          <FormSenha th={th} tema={tema} />
        )}
      </div>
    </div>
  )
}

// ── ABA APARÊNCIA ─────────────────────────────────────────
function FormAparencia({ th, tema, setTema, corTema, setCorTema }) {
  // Cada cor tem hex para o círculo de preview e um nome legível
  const cores = [
    { id: 'roxo',     hex: '#e733ea', nome: 'Roxo'   },
    { id: 'azul',     hex: '#0ea5e9', nome: 'Azul'   },
    { id: 'verde',    hex: '#059669', nome: 'Verde'   },
    { id: 'amarelo',  hex: '#d97706', nome: 'Âmbar'  },
    { id: 'rosa',     hex: '#db2777', nome: 'Rosa'   },
    { id: 'vermelho', hex: '#e11d48', nome: 'Rubi'   },
    { id: 'neutro',   hex: '#52525b', nome: 'Cinza'  },
  ]

  return (
    <div className={`rounded-2xl border p-6 space-y-8 ${th.card} ${th.border}`}>

      {/* MODO CLARO / ESCURO */}
      <div>
        <label className={`text-[10px] font-black uppercase tracking-widest block mb-4 ${th.subtext}`}>
          Modo do Sistema
        </label>
        <div className="flex gap-3">
          {[
            {
              id: 'light', label: 'Claro',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />,
            },
            {
              id: 'dark', label: 'Escuro',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />,
            },
          ].map(m => {
            const ativo = tema === m.id
            return (
              <button
                key={m.id}
                onClick={() => setTema(m.id)}
                className={`flex-1 py-4 flex flex-col items-center gap-2 rounded-xl border-2 transition ${
                  ativo
                    ? `${th.accentBorder} ${th.accentText}`
                    : `border-transparent ${th.muted} hover:${th.subtext}`
                } ${ativo ? th.card : 'bg-transparent'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {m.icon}
                </svg>
                <span className="text-sm font-bold">{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* COR DE DESTAQUE */}
      <div>
        <label className={`text-[10px] font-black uppercase tracking-widest block mb-4 ${th.subtext}`}>
          Cor de Destaque
        </label>
        <div className="grid grid-cols-7 gap-2">
          {cores.map(c => {
            const ativo = corTema === c.id
            return (
              <button
                key={c.id}
                onClick={() => setCorTema(c.id)}
                title={c.nome}
                className="flex flex-col items-center gap-2 group"
              >
                {/* Círculo com a cor real via style inline — sem depender do Tailwind */}
                <div
                  style={{ backgroundColor: c.hex }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
                    ${ativo ? 'ring-4 ring-offset-2 ring-offset-transparent scale-110' : 'opacity-70 group-hover:opacity-100 group-hover:scale-105'}`}
                  // ring-color via inline style para não depender de classes dinâmicas
                  // eslint-disable-next-line react/forbid-dom-props
                  ref={el => { if (el) el.style.setProperty('--tw-ring-color', c.hex) }}
                >
                  {ativo && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-[9px] font-bold transition ${ativo ? th.text : th.muted}`}>
                  {c.nome}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── ABA NOME ──────────────────────────────────────────────
function FormNome({ th, tema, perfil, onNomeAtualizado }) {
  const [nome, setNome] = useState(perfil?.nome || '')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ tipo: '', texto: '' })

  const salvar = async (e) => {
    e.preventDefault()
    if (!nome.trim()) { setMsg({ tipo: 'erro', texto: 'O nome não pode ficar vazio.' }); return }
    setLoading(true)
    setMsg({ tipo: '', texto: '' })
    const { error } = await supabase.from('perfis').update({ nome: nome.trim() }).eq('id', perfil.id)
    if (error) {
      setMsg({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' })
    } else {
      setMsg({ tipo: 'ok', texto: 'Nome atualizado com sucesso!' })
      onNomeAtualizado(nome.trim())
    }
    setLoading(false)
  }

  return (
    <div className={`rounded-2xl border p-6 ${th.card} ${th.border}`}>
      <p className={`text-sm mb-5 ${th.subtext}`}>
        Você pode usar um apelido ou nome fantasia. Este nome aparece para outros atendentes e no histórico.
      </p>
      <form onSubmit={salvar} className="space-y-4">
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest block mb-1.5 ${th.subtext}`}>
            Nome de exibição
          </label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Como você quer ser chamado?"
            className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 text-sm transition ${th.input} ${th.ring}`}
            maxLength={50}
            required
          />
          <p className={`text-[10px] mt-1 text-right ${th.muted}`}>{nome.length}/50</p>
        </div>
        <Feedback msg={msg} tema={tema} />
        <button
          type="submit"
          disabled={loading || nome.trim() === perfil?.nome}
          className={`w-full py-3 rounded-xl font-bold text-sm transition disabled:opacity-40 ${th.btnPrimary}`}
        >
          {loading ? 'Salvando...' : 'Salvar nome'}
        </button>
      </form>
    </div>
  )
}

// ── ABA SENHA ─────────────────────────────────────────────
function FormSenha({ th, tema }) {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrar, setMostrar]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [msg, setMsg]             = useState({ tipo: '', texto: '' })

  const salvar = async (e) => {
    e.preventDefault()
    setMsg({ tipo: '', texto: '' })
    if (novaSenha.length < 8) { setMsg({ tipo: 'erro', texto: 'A senha deve ter pelo menos 8 caracteres.' }); return }
    if (novaSenha !== confirmar) { setMsg({ tipo: 'erro', texto: 'As senhas não coincidem.' }); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    if (error) {
      setMsg({ tipo: 'erro', texto: 'Erro ao alterar senha. Tente novamente.' })
    } else {
      setMsg({ tipo: 'ok', texto: 'Senha alterada com sucesso!' })
      setNovaSenha(''); setConfirmar('')
    }
    setLoading(false)
  }

  const Olho = ({ vis }) => vis ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )

  return (
    <div className={`rounded-2xl border p-6 ${th.card} ${th.border}`}>
      <p className={`text-sm mb-5 ${th.subtext}`}>
        Escolha uma senha forte com pelo menos 8 caracteres.
      </p>
      <form onSubmit={salvar} className="space-y-4">
        {[
          { label: 'Nova senha',      value: novaSenha, set: setNovaSenha, placeholder: 'Digite a nova senha' },
          { label: 'Confirmar senha', value: confirmar,  set: setConfirmar, placeholder: 'Repita a nova senha' },
        ].map(f => (
          <div key={f.label}>
            <label className={`text-[10px] font-black uppercase tracking-widest block mb-1.5 ${th.subtext}`}>
              {f.label}
            </label>
            <div className="relative">
              <input
                type={mostrar ? 'text' : 'password'}
                value={f.value}
                onChange={e => f.set(e.target.value)}
                placeholder={f.placeholder}
                className={`w-full px-4 py-3 pr-10 rounded-xl border outline-none focus:ring-2 text-sm transition ${th.input} ${th.ring}`}
                minLength={8}
                required
              />
              <button type="button" onClick={() => setMostrar(v => !v)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${th.muted}`}>
                <Olho vis={mostrar} />
              </button>
            </div>
          </div>
        ))}
        <Feedback msg={msg} tema={tema} />
        <button type="submit" disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-sm transition disabled:opacity-40 ${th.btnPrimary}`}>
          {loading ? 'Salvando...' : 'Alterar senha'}
        </button>
      </form>
    </div>
  )
}

// ── FEEDBACK ──────────────────────────────────────────────
function Feedback({ msg, tema }) {
  if (!msg.texto) return null
  return (
    <p className={`text-xs px-3 py-2 rounded-xl border ${
      msg.tipo === 'ok'
        ? (tema === 'dark' ? 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50' : 'text-emerald-700 bg-emerald-50 border-emerald-200')
        : (tema === 'dark' ? 'text-red-400 bg-red-950/30 border-red-900/50'            : 'text-red-600 bg-red-50 border-red-200')
    }`}>
      {msg.texto}
    </p>
  )
}