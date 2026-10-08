import { useState } from 'react'
import { Box, Activity, GitBranch, Wrench, BookOpen } from 'lucide-react'
import Simulator from './components/Simulator.jsx'
import DecisionMatrix from './components/DecisionMatrix.jsx'
import Workshop from './components/Workshop.jsx'
import TheoryPresentation from './components/TheoryPresentation.jsx'

const TABS = [
  { id: 'sim', label: 'Simulador Cinemático 2D', icon: Activity, C: Simulator },
  { id: 'mat', label: 'Matriz de Decisión y Postproceso', icon: GitBranch, C: DecisionMatrix },
  { id: 'taller', label: 'Taller DfAM y Casos de Planta', icon: Wrench, C: Workshop },
  { id: 'teoria', label: 'Teoría y Presentación', icon: BookOpen, C: TheoryPresentation },
]

export default function App() {
  const [tab, setTab] = useState('sim')
  const [simTarget, setSimTarget] = useState(null)
  const goTab = (id) => {
    setSimTarget(null)
    setTab(id)
  }
  const openSim = (target) => {
    setSimTarget(target)
    setTab('sim')
    window.scrollTo({ top: 0 })
  }
  const Active = TABS.find((t) => t.id === tab).C
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200 border-t-4 border-t-amber-400 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-zinc-950"><Box size={20} /></span>
            <div className="leading-tight">
              <div className="font-semibold text-zinc-900">Manufactura Aditiva</div>
              <div className="text-[11px] text-zinc-500 font-mono">ISO/ASTM 52900 · Tecnología de Fabricación · UTN FRC</div>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1 md:ml-6">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => goTab(id)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                  tab === id
                    ? 'bg-amber-400 text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Active target={simTarget} onOpenSim={openSim} />
      </main>
      <footer className="border-t border-zinc-200 py-3 text-center text-xs text-zinc-500">
        Ingeniería Mecánica · 5.° año · Material didáctico — valores orientativos para fines de enseñanza
      </footer>
    </div>
  )
}
