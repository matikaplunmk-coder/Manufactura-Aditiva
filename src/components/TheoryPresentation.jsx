import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight, BookOpen, ChevronDown, ChevronLeft, ChevronRight, Info, KeyRound, List, Maximize2, Minimize2,
  Monitor, PlayCircle, Search, ShieldAlert, X,
} from 'lucide-react'
import { MODULES } from '../data/theory.js'

const CALLOUT = {
  key: { icon: KeyRound, cls: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-100', label: 'Concepto clave' },
  warn: { icon: ShieldAlert, cls: 'border-amber-500/50 bg-amber-500/10 text-amber-100', label: 'Atención' },
  info: { icon: Info, cls: 'border-sky-500/40 bg-sky-500/10 text-sky-100', label: 'Dato técnico' },
}

// Pliega acentos y mayúsculas conservando la longitud (para resaltar coincidencias).
const fold = (s) => Array.from(s).map((c) => c.normalize('NFD')[0]).join('').toLowerCase()

function Highlight({ text, query }) {
  if (!query) return text
  const f = fold(text)
  const q = fold(query)
  const parts = []
  let i = 0
  let j
  while ((j = f.indexOf(q, i)) !== -1) {
    parts.push(text.slice(i, j), <mark key={j} className="rounded bg-amber-400/30 px-0.5 text-amber-100">{text.slice(j, j + q.length)}</mark>)
    i = j + q.length
  }
  parts.push(text.slice(i))
  return parts
}

function Callout({ c, big }) {
  const st = CALLOUT[c.type] || CALLOUT.info
  const Icon = st.icon
  return (
    <div className={`flex gap-3 rounded-xl border p-4 ${st.cls} ${big ? 'text-lg' : 'text-sm'}`}>
      <Icon size={big ? 24 : 18} className="mt-0.5 shrink-0" />
      <div>
        <div className="mb-0.5 font-mono text-[11px] uppercase tracking-wider opacity-70">{st.label}</div>
        {c.text}
      </div>
    </div>
  )
}

function Flow({ steps, big }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`rounded-lg border border-slate-600 bg-slate-950 text-slate-100 ${big ? 'px-4 py-2.5 text-base' : 'px-3 py-1.5 text-sm'}`}>
            <span className="mr-2 font-mono text-xs text-cyan-400">{i + 1}</span>
            {s}
          </div>
          {i < steps.length - 1 && <ArrowRight size={big ? 20 : 16} className="text-cyan-500/70" />}
        </div>
      ))}
    </div>
  )
}

function SimButton({ sim, onOpenSim }) {
  if (!sim) return null
  return (
    <button
      onClick={() => onOpenSim({ tech: sim.tech, mode: sim.mode })}
      className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
    >
      <PlayCircle size={18} /> {sim.label || 'Ir al Simulador'}
    </button>
  )
}

/* ───────────────────────── Modo diapositivas ───────────────────────── */
function Slides({ onOpenSim }) {
  const slides = useMemo(
    () =>
      MODULES.flatMap((m) => [
        { kind: 'cover', module: m, sim: m.sim },
        ...m.slides.map((s, i) => ({ kind: 'slide', module: m, slide: s, sim: s.sim || null, idx: i + 1, total: m.slides.length })),
      ]),
    [],
  )
  const [i, setI] = useState(0)
  const [menu, setMenu] = useState(true)
  const [full, setFull] = useState(false)
  const root = useRef(null)
  const cur = slides[i]
  const go = useCallback((d) => setI((x) => Math.min(slides.length - 1, Math.max(0, x + d))), [slides.length])

  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Home') setI(0)
      else if (e.key === 'End') setI(slides.length - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, slides.length])

  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const toggleFull = () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen()
      else root.current?.requestFullscreen?.()
    } catch {
      /* el navegador puede bloquear pantalla completa */
    }
  }

  const m = cur.module
  return (
    <div ref={root} className={`flex flex-col bg-slate-950 ${full ? 'h-screen p-4' : ''}`}>
      <div className="mb-3 flex items-center gap-3">
        <button onClick={() => setMenu((v) => !v)} className="rounded-md border border-slate-700 p-2 text-slate-300 hover:bg-slate-800" title="Índice rápido">
          <List size={16} />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded bg-slate-800" role="progressbar" aria-valuemin={0} aria-valuemax={slides.length} aria-valuenow={i + 1}>
          <div className="h-full bg-cyan-400 transition-all" style={{ width: `${((i + 1) / slides.length) * 100}%` }} />
        </div>
        <span className="font-mono text-xs text-slate-400">{i + 1} / {slides.length}</span>
        <button onClick={toggleFull} className="rounded-md border border-slate-700 p-2 text-slate-300 hover:bg-slate-800" title="Pantalla completa">
          {full ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      <div className={`grid flex-1 gap-4 ${menu ? 'lg:grid-cols-[280px_1fr]' : ''}`}>
        {menu && (
          <nav className="max-h-[70vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-2 lg:max-h-none" aria-label="Índice">
            {MODULES.map((mod) => {
              const first = slides.findIndex((s) => s.module === mod)
              const active = mod === m
              return (
                <div key={mod.id}>
                  <button onClick={() => setI(first)} className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm ${active ? 'bg-cyan-500/15 text-cyan-100' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <span className="font-mono text-xs text-cyan-400">{mod.n}</span>
                    {mod.title}
                  </button>
                  {active && (
                    <div className="mb-1 ml-6 border-l border-slate-700 pl-2">
                      {slides.map((s, k) => s.module === mod && s.kind === 'slide' && (
                        <button key={k} onClick={() => setI(k)} className={`block w-full rounded px-2 py-1 text-left text-xs ${k === i ? 'text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}>
                          {s.slide.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        )}

        <article className={`flex min-h-[460px] flex-col rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 md:p-10 ${full ? 'overflow-y-auto' : ''}`}>
          <div className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            Módulo {m.n} · {cur.kind === 'cover' ? 'Portada' : `Diapositiva ${cur.idx}/${cur.total}`}
          </div>
          {cur.kind === 'cover' ? (
            <div className="flex flex-1 flex-col justify-center gap-5">
              <div className="font-mono text-7xl font-bold text-cyan-500/30">{String(m.n).padStart(2, '0')}</div>
              <h2 className="text-3xl font-bold text-slate-50 md:text-5xl">{m.title}</h2>
              <p className="text-lg text-slate-400">{m.short}</p>
              <div className="flex flex-wrap gap-2">
                {m.slides.map((s) => (
                  <span key={s.title} className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-400">{s.title}</span>
                ))}
              </div>
              <div><SimButton sim={cur.sim} onOpenSim={onOpenSim} /></div>
            </div>
          ) : (
            <div className="mt-2 flex flex-1 flex-col gap-5">
              <h2 className={`font-bold text-slate-50 ${full ? 'text-4xl' : 'text-2xl md:text-3xl'}`}>{cur.slide.title}</h2>
              <ul className={`space-y-3 ${full ? 'text-xl' : 'text-base md:text-lg'} text-slate-200`}>
                {cur.slide.bullets.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              {cur.slide.flow && <Flow steps={cur.slide.flow} big={full} />}
              {cur.slide.callout && <Callout c={cur.slide.callout} big={full} />}
              {cur.sim && <div><SimButton sim={cur.sim} onOpenSim={onOpenSim} /></div>}
            </div>
          )}
        </article>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button onClick={() => go(-1)} disabled={i === 0} className="flex items-center gap-1 rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-30">
          <ChevronLeft size={16} /> Anterior
        </button>
        <span className="hidden text-xs text-slate-600 sm:block">Usá las flechas ← → del teclado</span>
        <button onClick={() => go(1)} disabled={i === slides.length - 1} className="flex items-center gap-1 rounded-md bg-cyan-500/20 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-500/30 disabled:opacity-30">
          Siguiente <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

/* ───────────────────────── Modo apunte completo ───────────────────────── */
function Reading({ onOpenSim }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(() => new Set(['intro']))
  const q = query.trim()

  const results = useMemo(() => {
    const fq = fold(q)
    return MODULES.map((m) => {
      if (!fq) return { m, sections: m.reading, hits: 0 }
      const titleHit = fold(m.title).includes(fq)
      const sections = m.reading.filter((s) => titleHit || fold([s.h, ...s.p, ...(s.list || [])].join(' ')).includes(fq))
      const count = sections.reduce((n, s) => n + fold([s.h, ...s.p, ...(s.list || [])].join(' ')).split(fq).length - 1, 0)
      return { m, sections, hits: count }
    }).filter((r) => r.sections.length > 0)
  }, [q])

  const isOpen = (id) => (q ? true : open.has(id))
  const toggle = (id) =>
    setOpen((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por palabra clave (ej. zona muerta, HIP, Bowden…)"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-9 text-sm text-slate-100 outline-none focus:border-cyan-500"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200" aria-label="Limpiar">
              <X size={16} />
            </button>
          )}
        </div>
        {!q && (
          <div className="flex gap-2 text-sm">
            <button onClick={() => setOpen(new Set(MODULES.map((m) => m.id)))} className="rounded-md border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-800">Expandir todo</button>
            <button onClick={() => setOpen(new Set())} className="rounded-md border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-800">Contraer todo</button>
          </div>
        )}
      </div>
      {q && (
        <div className="text-sm text-slate-400">
          {results.length === 0 ? 'Sin resultados para ' : `${results.reduce((n, r) => n + r.hits, 0)} coincidencias en ${results.length} módulo(s) para `}
          <span className="text-amber-300">"{q}"</span>
        </div>
      )}

      {results.map(({ m, sections }) => (
        <section key={m.id} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <button onClick={() => !q && toggle(m.id)} aria-expanded={isOpen(m.id)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-800/60">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 font-mono text-sm text-cyan-300">{m.n}</span>
            <span className="flex-1">
              <span className="block font-semibold text-slate-100"><Highlight text={m.title} query={q} /></span>
              <span className="block text-xs text-slate-500">{m.short}</span>
            </span>
            <ChevronDown size={18} className={`text-slate-400 transition ${isOpen(m.id) ? 'rotate-180' : ''}`} />
          </button>
          {isOpen(m.id) && (
            <div className="space-y-5 border-t border-slate-800 p-5">
              {sections.map((s) => (
                <div key={s.h}>
                  <h4 className="mb-2 text-base font-semibold text-cyan-300"><Highlight text={s.h} query={q} /></h4>
                  {s.p.map((t) => (
                    <p key={t} className="mb-2 text-sm leading-relaxed text-slate-300"><Highlight text={t} query={q} /></p>
                  ))}
                  {s.list && (
                    <ul className="ml-1 space-y-1.5">
                      {s.list.map((t) => (
                        <li key={t} className="flex gap-2 text-sm leading-relaxed text-slate-300">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                          <span><Highlight text={t} query={q} /></span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              <SimButton sim={m.sim} onOpenSim={onOpenSim} />
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

export default function TheoryPresentation({ onOpenSim }) {
  const [mode, setMode] = useState('slides')
  const tabs = [
    { id: 'slides', label: 'Modo Diapositivas (Clase)', icon: Monitor },
    { id: 'read', label: 'Modo Apunte Completo (Lectura)', icon: BookOpen },
  ]
  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900 p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setMode(id)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition ${mode === id ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400 hover:text-slate-200'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      {mode === 'slides' ? <Slides onOpenSim={onOpenSim} /> : <Reading onOpenSim={onOpenSim} />}
    </div>
  )
}
