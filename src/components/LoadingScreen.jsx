export default function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-violet-400 font-mono text-xs tracking-widest uppercase">Carregando...</p>
      </div>
    </div>
  )
}