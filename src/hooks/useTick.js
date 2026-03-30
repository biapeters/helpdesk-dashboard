import { useState, useEffect } from 'react'

// Incrementa a cada 30s para forçar re-render do tempo de espera
export function useTick() {
  const [t, setT] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setT(n => n + 1), 30000)
    return () => clearInterval(id)
  }, [])
  return t
}