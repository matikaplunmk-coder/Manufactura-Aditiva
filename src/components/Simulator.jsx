import { useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, Layers, Flame, Droplets, Wrench, Gauge, Clock, Ruler } from 'lucide-react'
import { W, H, drawFDM, drawPBF, drawVAT, drawDED } from './canvasSims.js'

const TECHS = [
  { id: 'fdm', name: 'Extrusión (FDM/FFF)', short: 'Material Extrusion', icon: Layers },
  { id: 'pbf', name: 'Lecho de Polvo (SLS/SLM)', short: 'Powder Bed Fusion', icon: Flame },
  { id: 'vat', name: 'Fotopolimerización (SLA/CLIP)', short: 'Vat Photopolymerization', icon: Droplets },
  { id: 'ded', name: 'DED / Híbrido', short: 'Directed Energy Deposition', icon: Wrench },
]

const MODES = {
  fdm: [
    { id: 'direct', label: 'Direct Drive' },
    { id: 'bowden', label: 'Bowden' },
  ],
  pbf: [
    { id: 'sls', label: 'SLS (polímero)' },
    { id: 'slm', label: 'SLM (metal)' },
  ],
  vat: [
    { id: 'sla', label: 'SLA (stop & go)' },
    { id: 'clip', label: 'CLIP (continuo)' },
  ],
}

const NOTES = {
  'fdm:direct': [
    ['Masa del cabezal', '≈ 300–400 g: mayor inercia, menor aceleración admisible'],
    ['Camino de filamento', '≈ 30–50 mm: respuesta inmediata del flujo'],
    ['Retracción', '0,5–1,5 mm: ooze y stringing mínimos'],
    ['Flexibles (TPU)', 'Muy buena: el filamento queda guiado hasta la boquilla'],
  ],
  'fdm:bowden': [
    ['Masa del cabezal', '≈ 100–150 g: baja inercia, alta aceleración y velocidad'],
    ['Camino de filamento', '≈ 400–800 mm: el filamento actúa como resorte'],
    ['Retracción', '4–7 mm: retraso de flujo, ooze en cambios de dirección'],
    ['Flexibles (TPU)', 'Problemática: el filamento se pandea en el tubo'],
  ],
  'pbf:sls': [
    ['Fuente', 'Láser CO₂ sobre PA12 precalentado cerca de T de fusión'],
    ['Soportes', 'Ninguno: la cama de polvo sostiene la pieza'],
    ['Tensiones', 'Bajas: el polvo precalentado reduce gradientes'],
    ['Reciclado', 'Polvo reutilizable con mezcla fresco/usado ~ 30–50 %'],
  ],
  'pbf:slm': [
    ['Fuente', 'Láser de fibra 200–1000 W, atmósfera inerte (Ar/N₂)'],
    ['Soportes', 'Soldados al mismo material: anclan y evacúan calor'],
    ['Tensiones', 'Altas: ciclos térmicos locales → alivio en horno obligatorio'],
    ['Reciclado', 'Tamizado y control de O₂/humedad del polvo'],
  ],
  'vat:sla': [
    ['Ciclo', 'Exposición → despegue → retorno en cada capa'],
    ['Fuerza de despegue', 'Pico por succión/adhesión al film: limita geometrías y velocidad'],
    ['Velocidad', '≈ 10–40 mm/h'],
    ['Soportes', 'Obligatorios en voladizos y para resistir el despegue'],
  ],
  'vat:clip': [
    ['Zona muerta', 'Película líquida (~25–50 µm) donde el O₂ inhibe el curado'],
    ['Fuerza de despegue', 'Prácticamente nula: no hay adhesión a la ventana'],
    ['Velocidad', 'Hasta 25–100× más rápido que SLA según el fabricante'],
    ['Propiedades', 'Piezas más isótropas con resinas de curado dual'],
  ],
  ded: [
    ['Aporte', 'Polvo/alambre coaxial + láser: 0,3–1,5 mm de espesor de depósito'],
    ['Usos', 'Reparación de álabes, recargue, piezas grandes y gradientes de material'],
    ['Acabado as-built', 'Ra ≈ 10–50 µm: requiere mecanizado de terminación'],
    ['Híbrido', 'Aditivo + fresado 5 ejes en la misma máquina, mismo amarre'],
  ],
}

// Parámetros del modelo didáctico de tiempo y rugosidad base.
const PROC = {
  'fdm:direct': { over: 3, q0: 18, ref: 0.2, exp: 1, raBase: 5 },
  'fdm:bowden': { over: 3.5, q0: 20, ref: 0.2, exp: 1, raBase: 6 },
  'pbf:sls': { over: 14, q0: 60, ref: 0.1, exp: 0.3, raBase: 10 },
  'pbf:slm': { over: 12, q0: 12, ref: 0.1, exp: 0.8, raBase: 6 },
  'vat:sla': { over: 9, q0: 45, ref: 0.1, exp: 0.2, raBase: 1 },
  'vat:clip': { over: 0.3, q0: 200, ref: 0.1, exp: 0.2, raBase: 0.8 },
  ded: { over: 2, q0: 60, ref: 0.2, exp: 0.8, raBase: 15 },
}

const PART_H = 40 // mm
const PART_V = 80 // cm³
const R = 10 // mm, radio del borde curvo

const timeH = (h, p) => (PART_H / h) * p.over / 3600 + PART_V / (p.q0 * Math.pow(h / p.ref, p.exp))
const raStairMean = (h) => (h / 8) * 1000 // µm
const raStairMax = (h) => (h / 4) * 1000
const fmtTime = (hours) => {
  const m = Math.round(hours * 60)
  return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min` : `${m} min`
}

function useSim(canvasRef, key, onInfo, playing, speed, techId, modeId) {
  const state = useRef({ t: 0 })
  useEffect(() => {
    state.current.t = 0
  }, [key])
  useEffect(() => {
    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    let raf
    let last = performance.now()
    let lastStep = ''
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (playing) state.current.t += dt * speed
      const t = state.current.t
      let info
      if (techId === 'fdm') info = drawFDM(ctx, t, { direct: modeId === 'direct' })
      else if (techId === 'pbf') info = drawPBF(ctx, t, { metal: modeId === 'slm' })
      else if (techId === 'vat') info = drawVAT(ctx, t, { clip: modeId === 'clip' })
      else info = drawDED(ctx, t)
      if (info.step !== lastStep) {
        lastStep = info.step
        onInfo(info)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [canvasRef, playing, speed, techId, modeId, onInfo])
}

function StaircaseChart({ h }) {
  const s = 22 // px/mm
  const ox = 30
  const oy = 250
  const { steps, arc } = useMemo(() => {
    const n = Math.ceil(R / h)
    let d = `M ${ox} ${oy}`
    for (let i = 0; i < n; i++) {
      const z0 = i * h
      const z1 = Math.min(R, (i + 1) * h)
      const x = Math.sqrt(Math.max(0, R * R - z0 * z0)) // la capa toma el máximo ancho en su base
      d += ` L ${ox + x * s} ${oy - z0 * s} L ${ox + x * s} ${oy - z1 * s}`
    }
    d += ` L ${ox} ${oy - R * s} Z`
    let a = ''
    for (let k = 0; k <= 60; k++) {
      const z = (k / 60) * R
      const x = Math.sqrt(R * R - z * z)
      a += `${k === 0 ? 'M' : 'L'} ${ox + x * s} ${oy - z * s} `
    }
    return { steps: d, arc: a }
  }, [h])
  const nLayers = Math.ceil(R / h)
  return (
    <svg viewBox="0 0 330 290" className="w-full rounded-lg bg-zinc-50 border border-zinc-200">
      <defs>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#a1a1aa" strokeWidth="1" />
        </pattern>
      </defs>
      <path d={steps} fill="url(#hatch)" stroke="#3f3f46" strokeWidth="1" />
      <path d={arc} fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="5 3" />
      <line x1={ox} y1={oy} x2={ox + R * s + 20} y2={oy} stroke="#71717a" />
      <text x="150" y="24" fill="#52525b" fontSize="10" fontFamily="monospace">Corte · borde R = {R} mm</text>
      <text x="150" y="40" fill="#92400e" fontSize="10" fontFamily="monospace">- - geometría CAD ideal</text>
      <text x="150" y="56" fill="#3f3f46" fontSize="10" fontFamily="monospace">▒ capas ({nLayers})</text>
      <text x="150" y="72" fill="#b91c1c" fontSize="10" fontFamily="monospace">↑ cúspide máx = h</text>
      <text x={ox + R * s + 4} y={oy - 6} fill="#71717a" fontSize="10" fontFamily="monospace">cúspide → 0</text>
      <text x="14" y="278" fill="#71717a" fontSize="10" fontFamily="monospace">Dirección de construcción ↑ Z · h = {h.toFixed(2)} mm</text>
    </svg>
  )
}

function Curve({ title, unit, fn, h, color, fmt }) {
  const hs = Array.from({ length: 36 }, (_, i) => 0.05 + (i * 0.35) / 35)
  const vals = hs.map(fn)
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  const X = (x) => 8 + ((x - 0.05) / 0.35) * 184
  const Y = (v) => 52 - ((v - min) / (max - min || 1)) * 40
  const d = hs.map((x, i) => `${i ? 'L' : 'M'} ${X(x)} ${Y(vals[i])}`).join(' ')
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2">
      <div className="text-[11px] text-zinc-500 flex justify-between font-mono">
        <span>{title}</span>
        <span className="font-semibold text-zinc-900">{fmt(fn(h))} {unit}</span>
      </div>
      <svg viewBox="0 0 200 60" className="w-full">
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" />
        <line x1={X(h)} y1="4" x2={X(h)} y2="56" stroke="#a1a1aa" strokeDasharray="2 2" />
        <circle cx={X(h)} cy={Y(fn(h))} r="3.5" fill={color} />
      </svg>
    </div>
  )
}

export default function Simulator({ target }) {
  const [tech, setTech] = useState(target?.tech || 'fdm')
  const [modes, setModes] = useState(() => ({ fdm: 'direct', pbf: 'sls', vat: 'sla', ...(target?.mode && target.tech !== 'ded' ? { [target.tech]: target.mode } : {}) }))
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [h, setH] = useState(0.2)
  const [info, setInfo] = useState({ step: '', detail: '' })
  const canvasRef = useRef(null)
  const mode = modes[tech] || ''
  const procKey = tech === 'ded' ? 'ded' : `${tech}:${mode}`

  useSim(canvasRef, procKey, setInfo, playing, speed, tech, mode)

  const proc = PROC[procKey]
  const total = timeH(h, proc)
  const raS = raStairMean(h)
  const raMax = raStairMax(h)
  const raTot = Math.sqrt(raS * raS + proc.raBase * proc.raBase)
  const layers = Math.ceil(PART_H / h)
  const ok = raTot < 3

  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-wrap gap-2 mb-4">
          {TECHS.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTech(id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                tech === id ? 'border-amber-400 bg-amber-50 text-amber-950' : 'border-zinc-200 bg-white shadow-sm text-zinc-600 hover:border-zinc-300'
              }`}
            >
              <Icon size={15} /> {name}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-3">
            <canvas ref={canvasRef} className="w-full rounded-lg border border-zinc-300 bg-zinc-950" style={{ aspectRatio: `${W} / ${H}` }} />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button onClick={() => setPlaying((p) => !p)} className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-sm hover:bg-zinc-200">
                {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? 'Pausar' : 'Reanudar'}
              </button>
              <label className="flex items-center gap-2 text-xs text-zinc-600">
                Velocidad
                <input type="range" min="0.25" max="3" step="0.25" value={speed} onChange={(e) => setSpeed(+e.target.value)} />
                <span className="font-mono w-8">{speed}×</span>
              </label>
              {MODES[tech] && (
                <div className="ml-auto flex rounded-md border border-zinc-300 overflow-hidden">
                  {MODES[tech].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setModes((s) => ({ ...s, [tech]: m.id }))}
                      className={`px-3 py-1.5 text-sm ${mode === m.id ? 'bg-amber-100 text-amber-950' : 'text-zinc-600 hover:bg-zinc-100'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-4">
              <div className="text-[11px] uppercase tracking-wider text-amber-800 font-mono">{TECHS.find((x) => x.id === tech).short}</div>
              <div className="mt-1 font-semibold text-zinc-900">{info.step || '…'}</div>
              <p className="mt-1 text-sm text-zinc-600 leading-relaxed">{info.detail}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-4">
              <div className="mb-2 text-xs uppercase tracking-wider text-zinc-500 font-mono">Comparación técnica</div>
              <dl className="space-y-2">
                {NOTES[procKey].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-amber-900">{k}</dt>
                    <dd className="text-sm text-zinc-700">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-zinc-900">
            <Ruler size={18} className="text-amber-800" /> Espesor de capa · efecto escalera
          </div>
          <div className="flex flex-1 min-w-[260px] items-center gap-3">
            <span className="font-mono text-xs text-zinc-500">0,05</span>
            <input type="range" min="0.05" max="0.4" step="0.01" value={h} onChange={(e) => setH(+e.target.value)} className="flex-1" />
            <span className="font-mono text-xs text-zinc-500">0,40 mm</span>
            <span className="rounded-md bg-amber-100 px-2 py-1 font-mono text-sm text-amber-950">h = {h.toFixed(2)} mm</span>
          </div>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Proceso seleccionado: <span className="text-zinc-700">{TECHS.find((x) => x.id === tech).name}{MODES[tech] ? ` · ${MODES[tech].find((m) => m.id === mode).label}` : ''}</span> ·
          pieza de referencia: {PART_H} mm de alto, {PART_V} cm³. Modelo didáctico: Ra<sub>escalera</sub> = (cúspide)/4 con cúspide = h·cos α.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-[330px_1fr]">
          <StaircaseChart h={h} />
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500"><Gauge size={13} /> Ra escalera (media / máx.)</div>
                <div className="mt-1 font-mono text-xl text-amber-800">{raS.toFixed(1)} / {raMax.toFixed(0)} µm</div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500"><Gauge size={13} /> Ra total estimada</div>
                <div className={`mt-1 font-mono text-xl ${ok ? 'text-emerald-700' : 'text-rose-700'}`}>{raTot.toFixed(1)} µm</div>
                <div className="text-[11px] text-zinc-500">incluye Ra del proceso ≈ {proc.raBase} µm</div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500"><Clock size={13} /> Tiempo teórico</div>
                <div className="mt-1 font-mono text-xl text-amber-900">{fmtTime(total)}</div>
                <div className="text-[11px] text-zinc-500">{layers} capas</div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Curve title="Ra escalera vs h" unit="µm" fn={raStairMean} h={h} color="#d97706" fmt={(v) => v.toFixed(1)} />
              <Curve title="Tiempo vs h" unit="" fn={(x) => timeH(x, proc)} h={h} color="#3f3f46" fmt={fmtTime} />
            </div>
            <div className={`rounded-lg border p-3 text-sm ${ok ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
              {ok
                ? 'Ra < 3 µm: compatible con acabado de alta precisión sin postproceso (típico de fotopolimerización con capas finas).'
                : raTot > 25
                  ? 'Ra muy alta: el efecto escalera domina. Para Ra < 3 µm será necesario mecanizado, pulido o chorro abrasivo; evaluar reducir h o reorientar la pieza.'
                  : 'Ra intermedia: aceptable para piezas funcionales. Reducir h mejora el acabado pero el tiempo crece casi con 1/h.'}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
