import { useState } from 'react'
import { Box, Activity, GitBranch, Wrench } from 'lucide-react'
import Simulator from './components/Simulator.jsx'
import DecisionMatrix from './components/DecisionMatrix.jsx'
import Workshop from './components/Workshop.jsx'

const TABS = [
  { id: 'sim', label: 'Simulador Cinemático 2D', icon: Activity, C: Simulator },
  { id: 'mat', label: 'Matriz de Decisión y Postproceso', icon: GitBranch, C: DecisionMatrix },
  { id: 'taller', label: 'Taller DfAM y Casos de Planta', icon: Wrench, C: Workshop },
]

export default function App() {
  const [tab, setTab] = useState('sim')
  const Active = TABS.find((t) => t.id === tab).C
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Box className="text-cyan-400" size={22} />
            <div className="leading-tight">
              <div className="font-semibold text-slate-100">Manufactura Aditiva</div>
              <div className="text-[11px] text-slate-500 font-mono">ISO/ASTM 52900 · Tecnología de Fabricación · UTN FRC</div>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1 md:ml-6">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                  tab === id
                    ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/40'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Active />
      </main>
      <footer className="border-t border-slate-800 py-3 text-center text-xs text-slate-600">
        Ingeniería Mecánica · 5.° año · Material didáctico — valores orientativos para fines de enseñanza
      </footer>
    </div>
  )
}
