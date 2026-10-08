import { useState } from 'react'
import { CheckCircle2, XCircle, RotateCcw, Banknote, Thermometer, Atom, Trophy } from 'lucide-react'
import { CASES } from '../data/cases.js'

const JUST_ICON = { Económica: Banknote, Térmica: Thermometer, Metalúrgica: Atom }

export default function Cases() {
  const [active, setActive] = useState(0)
  const [answers, setAnswers] = useState({}) // caseId -> índice elegido
  const c = CASES[active]
  const chosen = answers[c.id]
  const answered = chosen !== undefined
  const score = CASES.filter((x) => answers[x.id] === x.correct).length
  const done = Object.keys(answers).length

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <div className="space-y-2">
        {CASES.map((x, i) => {
          const a = answers[x.id]
          return (
            <button key={x.id} onClick={() => setActive(i)} className={`w-full rounded-lg border p-3 text-left text-sm transition ${i === active ? 'border-amber-400 bg-amber-50' : 'border-zinc-200 bg-white shadow-sm hover:border-zinc-300'}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-500">CASO {x.id}</span>
                {a !== undefined && (a === x.correct ? <CheckCircle2 size={15} className="text-emerald-700" /> : <XCircle size={15} className="text-rose-700" />)}
              </div>
              <div className="mt-0.5 text-zinc-800">{x.title}</div>
            </button>
          )
        })}
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white shadow-sm p-3 text-sm">
          <span className="flex items-center gap-2 text-zinc-700"><Trophy size={15} className="text-amber-800" /> {score} / {CASES.length} correctos</span>
          <button onClick={() => setAnswers({})} title="Reiniciar" className="rounded p-1 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800"><RotateCcw size={15} /></button>
        </div>
        <div className="text-xs text-zinc-500">Respondidos: {done}/{CASES.length}</div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5">
        <div className="font-mono text-xs uppercase tracking-wider text-amber-800">{c.tag}</div>
        <h3 className="mt-1 text-xl font-semibold text-zinc-900">{c.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700">{c.scenario}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {c.needs.map((n) => (
            <li key={n} className="rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">{n}</li>
          ))}
        </ul>

        <div className="mt-5 text-sm font-medium text-zinc-800">¿Qué tecnología corresponde?</div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {c.options.map((o, i) => {
            const isCorrect = i === c.correct
            const isChosen = i === chosen
            let cls = 'border-zinc-300 bg-zinc-50 text-zinc-700 hover:border-amber-400'
            if (answered) cls = isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : isChosen ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-zinc-200 bg-zinc-50 text-zinc-500'
            return (
              <button key={o.name} disabled={answered} onClick={() => setAnswers((a) => ({ ...a, [c.id]: i }))} className={`rounded-lg border p-3 text-left text-sm transition ${cls}`}>
                <span className="mr-2 font-mono text-xs opacity-70">{'ABCD'[i]}</span>{o.name}
              </button>
            )
          })}
        </div>

        {answered && (
          <div className="mt-5 space-y-3">
            <div className={`flex gap-2 rounded-lg border p-3 text-sm ${chosen === c.correct ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-rose-50 text-rose-900'}`}>
              {chosen === c.correct ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <XCircle size={18} className="mt-0.5 shrink-0" />}
              <div>
                <div className="font-semibold">{chosen === c.correct ? '¡Respuesta correcta!' : 'Respuesta incorrecta'}</div>
                <p className="mt-0.5">{c.options[chosen].why}</p>
                {chosen !== c.correct && <p className="mt-1 text-zinc-700"><b>Correcta:</b> {c.options[c.correct].name}. {c.options[c.correct].why.replace(/^Correcto: /, '')}</p>}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {Object.entries(c.just).map(([k, v]) => {
                const Icon = JUST_ICON[k]
                return (
                  <div key={k} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber-900"><Icon size={15} /> Viabilidad {k.toLowerCase()}</div>
                    <p className="text-sm leading-relaxed text-zinc-600">{v}</p>
                  </div>
                )
              })}
            </div>
            {active < CASES.length - 1 && (
              <button onClick={() => setActive(active + 1)} className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-500">Siguiente caso →</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
