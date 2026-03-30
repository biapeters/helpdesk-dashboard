import { useEffect, useRef } from 'react'
import { tocarSom, piscarAba } from '../utils/helpers'

export function useNotificacoes(conversas, somAtivo) {
  const idsConhecidos = useRef(new Set())
  const inicializado = useRef(false)

  useEffect(() => {
    if (!inicializado.current) {
      conversas.forEach(c => idsConhecidos.current.add(c.id))
      inicializado.current = true
      return
    }
    conversas.forEach(c => {
      if (c.status === 'aguardando' && !idsConhecidos.current.has(c.id)) {
        idsConhecidos.current.add(c.id)
        if (somAtivo) tocarSom()
        piscarAba()
      }
    })
  }, [conversas])
}