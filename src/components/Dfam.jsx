import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ArrowUp, Info } from 'lucide-react'

// Escuadra con nervio (vista lateral, mm). Extrusión de profundidad D.
const OUTER = [
  [0, 0],
  [70, 0],
  [70, 20],
  [45, 20],
  [20, 50],
  [20, 80],
  [0, 80],
]
const HOLES = [
  { c: [10, 66], r: 5 },
  { c: [58, 10], r: 4.5 },
]
const DEPTH = 30
const LAYER = 0.1 // mm
const ANGLES = [0, 45, 90]

const circle = (c, r, n = 28) => Array.from({ length: n }, (_, i) => [c[0] + r * Math.cos((-2 * Math.PI * i) / n), c[1] + r * Math.sin((-2 * Math.PI * i) / n)])
const polyArea = (p) => p.reduce((a, [x, y], i) => a + (x * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * y), 0) / 2

function analyze(deg) {
  const th = (deg * Math.PI) / 180
  const rot = ([x, y]) => [x * Math.cos(th) - y * Math.sin(th), x * Math.sin(th) + y * Math.cos(th)]
  // contorno exterior CCW; huecos CW (la normal exterior apunta hacia el hueco)
  const loops = [OUTER.map(rot), ...HOLES.map((h) => circle(h.c, h.r).map(rot))]
  const minY = Math.min(...loops[0].map((p) => p[1]))
  const maxY = Math.max(...loops[0].map((p) => p[1]))
  const minX = Math.min(...loops[0].map((p) => p[0]))
  const loopsT = loops.map((l) => l.map(([x, y]) => [x - minX, y - minY]))
  const all = []
  loopsT.forEach((l, li) => l.forEach((a, i) => all.push({ a, b: l[(i + 1) % l.length], li })))
  const outerCCW = polyArea(loopsT[0]) > 0
  let projArea = 0
  let supVol = 0
  const overhangs = []
  all.forEach(({ a, b, li }, idx) => {
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy)
    if (len < 1e-6) return
    // normal exterior al material: contorno CCW → (dy,-dx); huecos (círculos CCW) → invertida
    let nx = dy / len
    let ny = -dx / len
    if (!outerCCW) { nx = -nx; ny = -ny }
    if (ny >= -0.7071) return // inclinación ≥ 45° respecto a la horizontal: autoportante
    const my = (a[1] + b[1]) / 2
    const mx = (a[0] + b[0]) / 2
    if (Math.abs(ny) > 0.999 && my < 0.01) return // apoyada sobre la placa
    const lenP = Math.abs(dx)
    // altura de soporte: hasta la placa o hasta la superficie que esté debajo
    let hit = 0
    all.forEach((e, j) => {
      if (j === idx) return
      const x0 = e.a[0]
      const x1 = e.b[0]
      if ((mx - x0) * (mx - x1) > 0 || Math.abs(x1 - x0) < 1e-9) return
      const s = (mx - x0) / (x1 - x0)
      const y = e.a[1] + s * (e.b[1] - e.a[1])
      if (y < my - 1e-6 && y > hit) hit = y
    })
    projArea += lenP * DEPTH
    supVol += lenP * (my - hit) * DEPTH * 0.15
    overhangs.push({ a, b, lenP, bottom: hit })
  })
  const H = maxY - minY
  // dirección de la tensión principal (eje de la pierna vertical) respecto a Z
  const t = rot([0, 1])
  const cos2 = t[1] * t[1]
  const width = Math.max(...loopsT[0].map((p) => p[0]))
  const volCm3 = (Math.abs(polyArea(OUTER)) - HOLES.reduce((s, h) => s + Math.PI * h.r * h.r, 0)) * DEPTH / 1000
  const layers = Math.ceil(H / LAYER)
  const hours = (layers * 9) / 3600 + (volCm3 + supVol / 1000) / 14
  return { rot, minX, minY, loops: loopsT, overhangs, projArea, supVol, H, width, cos2, layers, hours, tAngle: th, volCm3 }
}

const fmt = (h) => `${Math.floor(h)} h ${String(Math.round((h % 1) * 60)).padStart(2, '0')} min`

export default function Dfam() {
  const [deg, setDeg] = useState(0)
  const results = useMemo(() => Object.fromEntries(ANGLES.map((a) => [a, analyze(a)])), [])
  const r = results[deg]
  const risk = r.cos2 >= 0.6 ? 'crit' : r.cos2 >= 0.25 ? 'mod' : 'ok'
  const minArea = Math.min(...ANGLES.map((a) => results[a].projArea))

  const S = 2.6
  const ox = 80
  const oy = 270
  const P = ([x, y]) => `${ox + x * S},${oy - y * S}`
  const path = r.loops.map((l) => `M ${l.map(P).join(' L ')} Z`).join(' ')
  // dirección de la carga (empuje lateral en la punta de la pierna) y tracción de raíz
  const tr = (pt) => {
    const [x, y] = r.rot(pt)
    return [x - r.minX, y - r.minY]
  }
  const f0 = tr([-30, 72])
  const f1 = tr([-1, 72])

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-600">Orientación de construcción:</span>
          {ANGLES.map((a) => (
            <button key={a} onClick={() => setDeg(a)} className={`rounded-md border px-3 py-1.5 font-mono text-sm ${deg === a ? 'border-amber-400 bg-amber-100 text-amber-950' : 'border-zinc-300 text-zinc-600 hover:bg-zinc-100'}`}>
              {a}°
            </button>
          ))}
        </div>
        <svg viewBox="0 0 420 300" className="w-full rounded-lg border border-zinc-200 bg-zinc-50">
          <defs>
            <pattern id="sup" width="5" height="5" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="5" stroke="#dc2626" strokeWidth="1" />
            </pattern>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#92400e" />
            </marker>
            <marker id="arrC" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#0369a1" />
            </marker>
          </defs>
          {/* líneas de capa */}
          {Array.from({ length: 26 }, (_, i) => (
            <line key={i} x1="10" x2="410" y1={oy - i * 10} y2={oy - i * 10} stroke="#e4e4e7" />
          ))}
          <rect x="10" y={oy} width="400" height="10" fill="#a1a1aa" />
          <text x="14" y={oy + 21} fill="#71717a" fontSize="7" fontFamily="monospace">Placa base</text>
          {/* soportes */}
          {r.overhangs.map((o, i) => {
            const [ax, ay] = o.a
            const [bx, by] = o.b
            const bot = o.bottom
            return (
              <polygon key={i} points={`${P([ax, ay])} ${P([bx, by])} ${P([bx, bot])} ${P([ax, bot])}`} fill="url(#sup)" stroke="#dc2626" strokeOpacity="0.5" />
            )
          })}
          <path d={path} fill="#52525b" fillRule="evenodd" stroke="#18181b" strokeWidth="1.5" />
          {/* aristas en voladizo */}
          {r.overhangs.map((o, i) => (
            <line key={i} x1={ox + o.a[0] * S} y1={oy - o.a[1] * S} x2={ox + o.b[0] * S} y2={oy - o.b[1] * S} stroke="#ef4444" strokeWidth="3" />
          ))}
          {/* ejes y carga */}
          <line x1="385" y1="270" x2="385" y2="190" stroke="#0369a1" strokeWidth="2" markerEnd="url(#arrC)" />
          <text x="372" y="182" fill="#0369a1" fontSize="8" fontFamily="monospace">Z</text>
          <line x1={ox + f0[0] * S} y1={oy - f0[1] * S} x2={ox + f1[0] * S} y2={oy - f1[1] * S} stroke="#d97706" strokeWidth="2.5" markerEnd="url(#arr)" />
          <text x={ox + f0[0] * S - 4} y={oy - f0[1] * S - 8} fill="#92400e" fontSize="8" fontFamily="monospace">F</text>
          <text x="14" y="14" fill="#52525b" fontSize="7" fontFamily="monospace">Rojo = caras con ángulo &lt; 45° sobre la horizontal (soporte)</text>
          <text x="14" y="24" fill="#92400e" fontSize="7" fontFamily="monospace">F = carga de trabajo (flexión de la pierna) · σ de raíz ∥ eje de la pierna</text>
        </svg>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ['Altura Z', `${r.H.toFixed(1)} mm`, 'text-amber-900'],
            ['Capas', `${r.layers}`, 'text-zinc-800'],
            ['Tiempo est.', fmt(r.hours), 'text-amber-900'],
          ].map(([k, v, c]) => (
            <div key={k} className="rounded-lg border border-zinc-200 bg-white shadow-sm p-2.5">
              <div className="text-[11px] text-zinc-500">{k}</div>
              <div className={`font-mono text-sm ${c}`}>{v}</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm p-3">
          <div className="text-xs text-zinc-500">Área de soporte proyectada (caras &lt; 45°)</div>
          <div className="font-mono text-2xl text-rose-700">{r.projArea.toFixed(0)} mm²</div>
          <div className="text-xs text-zinc-500">Volumen de soporte ≈ {(r.supVol / 1000).toFixed(1)} cm³ (densidad 15 %) · profundidad {DEPTH} mm</div>
        </div>
        <div className={`rounded-lg border p-3 text-sm ${risk === 'crit' ? 'border-rose-300 bg-rose-50 text-rose-900' : risk === 'mod' ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-emerald-300 bg-emerald-50 text-emerald-900'}`}>
          <div className="flex items-center gap-2 font-semibold">
            {risk === 'ok' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {risk === 'crit' ? 'Advertencia estructural: tracción interlaminar' : risk === 'mod' ? 'Precaución: tracción parcialmente interlaminar' : 'Carga alineada con el plano de capas'}
          </div>
          <p className="mt-1">
            La tensión de tracción en la raíz actúa a {(Math.acos(Math.sqrt(r.cos2)) * 180 / Math.PI).toFixed(0)}° de Z: {(r.cos2 * 100).toFixed(0)} % de σ solicita normalmente la unión entre capas (σ·cos²φ).
            {risk === 'crit' && ' La resistencia en Z es la menor del material (FDM ≈ 50 %): riesgo de delaminación.'}
            {risk === 'mod' && ' Hay además cortante interlaminar: verificar con el factor de anisotropía.'}
            {risk === 'ok' && ' La tracción principal se resiste en el plano XY, donde el material es más resistente.'}
          </p>
        </div>
        <table className="w-full overflow-hidden rounded-lg border border-zinc-200 text-xs">
          <thead className="bg-white text-zinc-500">
            <tr><th className="p-2 text-left">Orient.</th><th>Z</th><th>Soporte</th><th>σ⊥capa</th></tr>
          </thead>
          <tbody>
            {ANGLES.map((a) => (
              <tr key={a} className={`border-t border-zinc-200 text-center font-mono ${a === deg ? 'bg-amber-50 text-amber-950' : 'text-zinc-600'}`}>
                <td className="p-2 text-left">{a}°{results[a].projArea - minArea < 1 && ' ★'}</td>
                <td>{results[a].H.toFixed(0)} mm</td>
                <td>{results[a].projArea.toFixed(0)} mm²</td>
                <td>{(results[a].cos2 * 100).toFixed(0)} %</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="flex gap-2 text-xs text-zinc-500"><Info size={14} className="mt-0.5 shrink-0" /> ★ = menor área de soporte. El compromiso típico: mínima altura (tiempo), mínimo soporte y carga fuera del eje Z.</p>
      </div>
    </div>
  )
}
