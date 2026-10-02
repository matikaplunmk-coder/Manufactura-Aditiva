import { useMemo, useState } from 'react'
import { ArrowRight, AlertTriangle, Anchor, Wind, Droplet, Layers, Ban, CheckCircle2, Info } from 'lucide-react'
import { MATERIALS, LOADS, GEOMETRIES, FINISHES, FAMILIES, recommend } from '../data/decision.js'

const SUPPORT_STYLE = {
  welded: { icon: Anchor, color: 'text-rose-300', border: 'border-rose-500/40', bg: 'bg-rose-500/10' },
  soluble: { icon: Droplet, color: 'text-sky-300', border: 'border-sky-500/40', bg: 'bg-sky-500/10' },
  breakaway: { icon: Layers, color: 'text-amber-300', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
  powder: { icon: Wind, color: 'text-emerald-300', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
  photo: { icon: Layers, color: 'text-violet-300', border: 'border-violet-500/40', bg: 'bg-violet-500/10' },
  none: { icon: Ban, color: 'text-slate-300', border: 'border-slate-600', bg: 'bg-slate-800/50' },
}

function Group({ title, children }) {
  return (
    <fieldset className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <legend className="px-2 text-xs font-mono uppercase tracking-wider text-cyan-400">{title}</legend>
      <div className="space-y-1.5">{children}</div>
    </fieldset>
  )
}

function Option({ type = 'radio', checked, onChange, label, sub }) {
  return (
    <label className={`flex cursor-pointer items-start gap-2 rounded-md border px-2.5 py-2 text-sm transition ${checked ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-100' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}>
      <input type={type} checked={checked} onChange={onChange} className="mt-1 accent-cyan-400" />
      <span>
        {label}
        {sub && <span className="block text-xs text-slate-500">{sub}</span>}
      </span>
    </label>
  )
}

function Anisotropy({ z, note }) {
  const bar = (label, v, color) => (
    <div>
      <div className="mb-1 flex justify-between font-mono text-xs text-slate-400">
        <span>{label}</span>
        <span>{v}%</span>
      </div>
      <div className="h-3 rounded bg-slate-800">
        <div className={`h-3 rounded ${color}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  )
  const color = z >= 85 ? 'bg-emerald-400' : z >= 65 ? 'bg-amber-400' : 'bg-rose-400'
  const label = z >= 85 ? 'Casi isótropa' : z >= 65 ? 'Anisotropía moderada' : 'Fuerte anisotropía'
  return (
    <div className="space-y-3">
      {bar('Resistencia en XY (plano de capa)', 100, 'bg-cyan-400')}
      {bar('Resistencia en Z (entre capas)', z, color)}
      <div className="flex items-start gap-2 text-sm text-slate-400">
        <span className={`mt-0.5 rounded px-1.5 py-0.5 text-[11px] font-mono ${z >= 85 ? 'bg-emerald-500/20 text-emerald-300' : z >= 65 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'}`}>{label}</span>
        <span>{note}</span>
      </div>
    </div>
  )
}

export default function DecisionMatrix() {
  const [material, setMaterial] = useState('metal')
  const [load, setLoad] = useState('critical')
  const [geo, setGeo] = useState(['channels'])
  const [finish, setFinish] = useState('precise')

  const res = useMemo(() => recommend({ material, load, geo, finish }), [material, load, geo, finish])
  const toggle = (id) => setGeo((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]))
  const sup = SUPPORT_STYLE[res.support.type]
  const SupIcon = sup.icon

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <Group title="Material">
          {MATERIALS.map((m) => (
            <Option key={m.id} checked={material === m.id} onChange={() => setMaterial(m.id)} label={m.label} sub={m.sub} />
          ))}
        </Group>
        <Group title="Solicitación mecánica">
          {LOADS.map((m) => (
            <Option key={m.id} checked={load === m.id} onChange={() => setLoad(m.id)} label={m.label} />
          ))}
        </Group>
        <Group title="Geometría crítica (múltiple)">
          {GEOMETRIES.map((m) => (
            <Option key={m.id} type="checkbox" checked={geo.includes(m.id)} onChange={() => toggle(m.id)} label={m.label} />
          ))}
        </Group>
        <Group title="Tolerancia / acabado">
          {FINISHES.map((m) => (
            <Option key={m.id} checked={finish === m.id} onChange={() => setFinish(m.id)} label={m.label} />
          ))}
        </Group>
      </div>

      <div className="space-y-4">
        <section className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <CheckCircle2 size={14} /> Tecnología recomendada · ISO/ASTM 52900
          </div>
          <h2 className="mt-1 text-2xl font-semibold text-slate-50">{res.tech}</h2>
          <div className="mt-1 text-sm text-slate-400">
            Familia de proceso: <span className="rounded bg-cyan-500/15 px-2 py-0.5 font-mono text-cyan-200">{res.family}</span>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
            {res.why.map((w) => (
              <li key={w} className="flex gap-2"><span className="text-cyan-400">▸</span>{w}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {FAMILIES.map((f) => (
              <span key={f} className={`rounded px-2 py-0.5 text-[11px] font-mono ${f === res.family ? 'bg-cyan-500/25 text-cyan-100 ring-1 ring-cyan-500/50' : 'bg-slate-800 text-slate-600'}`}>{f}</span>
            ))}
          </div>
        </section>

        {res.warnings.length > 0 && (
          <div className="space-y-2">
            {res.warnings.map((w) => (
              <div key={w} className="flex gap-2 rounded-lg border border-amber-600/40 bg-amber-950/30 p-3 text-sm text-amber-200">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {w}
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <section className={`rounded-xl border p-4 ${sup.border} ${sup.bg}`}>
            <div className="mb-1 text-xs font-mono uppercase tracking-wider text-slate-400">Comportamiento de soportes</div>
            <div className={`flex items-center gap-2 font-semibold ${sup.color}`}><SupIcon size={18} /> {res.support.title}</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{res.support.text}</p>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 text-xs font-mono uppercase tracking-wider text-slate-400">Isotropía mecánica · Z vs XY</div>
            <Anisotropy z={res.zRatio} note={res.isoNote} />
            {load === 'critical' && res.zRatio < 85 && (
              <p className="mt-3 flex gap-2 text-xs text-rose-300"><Info size={14} className="shrink-0" /> Orientar la pieza para que la carga principal actúe en el plano XY.</p>
            )}
          </section>
        </div>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-3 text-xs font-mono uppercase tracking-wider text-slate-400">Cadena obligatoria de postprocesamiento</div>
          <ol className="flex flex-wrap items-stretch gap-2">
            {res.chain.map((s, i) => (
              <li key={s.name} className="flex items-center gap-2">
                <div className="h-full max-w-[220px] rounded-lg border border-slate-700 bg-slate-950 p-2.5" title={s.why}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 font-mono text-[11px] text-cyan-200">{i + 1}</span>
                    <span className="text-sm font-medium text-slate-100">{s.name}</span>
                  </div>
                  <p className="mt-1 text-xs leading-snug text-slate-500">{s.why}</p>
                </div>
                {i < res.chain.length - 1 && <ArrowRight size={16} className="shrink-0 text-slate-600" />}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
