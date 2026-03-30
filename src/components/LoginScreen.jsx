import { useState, useRef } from 'react'
import { supabase } from '../supabaseClient'

// Domínios permitidos 
const DOMINIOS_PERMITIDOS = ['@suaempresa.com.br']

const tentativas = { count: 0, bloqueadoAte: null }

export default function LoginScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const emailRef = useRef(null)

  const validarEmail = (e) => {
    if (!e) return 'Informe o e-mail.'
    if (!DOMINIOS_PERMITIDOS.some(d => e.toLowerCase().endsWith(d)))
      return 'Use seu e-mail corporativo.'
    // Sanidade básica de formato
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
      return 'Formato de e-mail inválido.'
    return null
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setErro('')

    // Rate limit no cliente: bloqueia após 5 tentativas por 2 minutos
    if (tentativas.bloqueadoAte && Date.now() < tentativas.bloqueadoAte) {
      const restante = Math.ceil((tentativas.bloqueadoAte - Date.now()) / 1000)
      setErro(`Muitas tentativas. Aguarde ${restante}s antes de tentar novamente.`)
      return
    }

    const erroEmail = validarEmail(email.trim().toLowerCase())
    if (erroEmail) { setErro(erroEmail); return }

    if (password.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      tentativas.count += 1
      if (tentativas.count >= 5) {
        tentativas.bloqueadoAte = Date.now() + 2 * 60 * 1000 // 2 min
        tentativas.count = 0
        setErro('Conta temporariamente bloqueada por segurança. Aguarde 2 minutos.')
      } else {
        setErro('Credenciais inválidas. Verifique e tente novamente.')
      }
    } else {
      tentativas.count = 0
      tentativas.bloqueadoAte = null
    }

    setLoading(false)
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600 mb-4 shadow-xl shadow-violet-900/40">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">HelpDesk</h1>
          <p className="text-slate-500 text-sm mt-1">Painel de Atendimento · G&amp;C</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3" autoComplete="off">
          <input
            ref={emailRef}
            type="email"
            placeholder="email@skelt.com.br"
            value={email}
            autoComplete="username"
            className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-600 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-600 text-sm transition"
            onChange={e => setEmail(e.target.value)}
            required
          />

          {/* Campo de senha com toggle de visibilidade */}
          <div className="relative">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              autoComplete="current-password"
              className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-600 px-4 py-3 pr-11 rounded-xl outline-none focus:ring-2 focus:ring-violet-600 text-sm transition"
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
              tabIndex={-1}
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {mostrarSenha ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {erro && (
            <p className="text-red-400 text-xs text-center bg-red-950/30 border border-red-900/50 rounded-lg py-2 px-3">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-40 text-sm"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-slate-700 text-[10px] mt-6">
          Acesso restrito a colaboradores. Em caso de problemas, contate o administrador.
        </p>
      </div>
    </div>
  )
}