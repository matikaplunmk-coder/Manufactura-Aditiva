import { useState } from 'react'
import { Compass, Briefcase } from 'lucide-react'
import Dfam from './Dfam.jsx'
import Cases from './Cases.jsx'

const SUBS = [
  { id: 'a', label: 'A · Simulador de orientación DfAM', icon: Compass, C: Dfam },
  { id: 'b', label: 'B · Casos de estudio de planta', icon: Briefcase, C: Cases },
]

export default function Workshop() {
  const [sub, setSub] = useState('a')
  const Active = SUBS.find((s) => s.id === sub).C
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SUBS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setSub(id)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${sub === id ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-200' : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      <Active />
    </div>
  )
}
