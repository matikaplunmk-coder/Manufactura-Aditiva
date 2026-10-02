// Animaciones 2D en Canvas para las 4 tecnologías. Cada función dibuja un frame
// completo en un lienzo lógico de 800x440 y devuelve { step, detail } para el panel.
export const W = 800
export const H = 440

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (u) => {
  u = clamp(u)
  return u * u * (3 - 2 * u)
}
const lerp = (a, b, u) => a + (b - a) * u
const tri = (u) => {
  u = ((u % 1) + 1) % 1
  return u < 0.5 ? u * 2 : 2 - u * 2
}
const seg = (p, a, b) => clamp((p - a) / (b - a))

const C = {
  bg: '#020617',
  grid: '#0f172a',
  steel: '#475569',
  steelLight: '#94a3b8',
  dark: '#1e293b',
  hot: '#fb923c',
  molten: '#f97316',
  text: '#94a3b8',
  cyan: '#22d3ee',
  powder: '#a8a29e',
  part: '#94a3b8',
}

function background(ctx) {
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = C.grid
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= W; x += 40) {
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, H)
  }
  for (let y = 0; y <= H; y += 40) {
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(W, y + 0.5)
  }
  ctx.stroke()
}

function label(ctx, text, x, y, color = C.text, align = 'left', size = 11) {
  ctx.font = `${size}px ui-monospace, Menlo, monospace`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
}

function leader(ctx, x1, y1, x2, y2, text, color = C.text, align = 'left') {
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  label(ctx, text, x2 + (align === 'left' ? 4 : -4), y2, color, align)
}

function glow(ctx, x, y, r, color, alpha = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.globalAlpha = alpha
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

function chips(ctx, items, active, x = 14, y = 14) {
  let cx = x
  ctx.font = '11px ui-monospace, Menlo, monospace'
  items.forEach((it, i) => {
    const w = ctx.measureText(it).width + 18
    ctx.fillStyle = i === active ? 'rgba(34,211,238,0.2)' : 'rgba(30,41,59,0.8)'
    ctx.strokeStyle = i === active ? '#22d3ee' : '#334155'
    ctx.beginPath()
    ctx.roundRect(cx, y, w, 22, 5)
    ctx.fill()
    ctx.stroke()
    label(ctx, it, cx + 9, y + 11.5, i === active ? '#67e8f9' : '#64748b')
    cx += w + 6
  })
}

// ───────────────────────── 1. EXTRUSIÓN FDM / FFF ─────────────────────────
export function drawFDM(ctx, t, { direct }) {
  background(ctx)
  const LAYERS = 16
  const LH = 8
  const bedTop = 370
  const xl = 300
  const xr = 500
  const Tl = direct ? 2.4 : 1.7 // el cabezal Bowden es liviano: barre más rápido
  const idx = Math.floor(t / Tl) % (LAYERS + 3)
  const u = (t % Tl) / Tl
  const n = Math.min(idx, LAYERS - 1)
  const finished = idx >= LAYERS
  const dirR = n % 2 === 0
  const vel = (uu) => 6 * clamp(uu) * (1 - clamp(uu)) // perfil de velocidad (acelera / frena)
  const pos = (uu) => (dirR ? lerp(xl, xr, ease(uu)) : lerp(xr, xl, ease(uu)))
  const nx = finished ? 400 : pos(u)
  const layerY = bedTop - (n + 1) * LH
  const ny = finished ? bedTop - LAYERS * LH - 2 : layerY - 2

  // cama calefaccionada
  const bg = ctx.createLinearGradient(0, bedTop, 0, bedTop + 26)
  bg.addColorStop(0, '#ef4444')
  bg.addColorStop(1, '#7f1d1d')
  ctx.fillStyle = bg
  ctx.fillRect(200, bedTop, 400, 26)
  ctx.fillStyle = C.steel
  ctx.fillRect(190, bedTop + 26, 420, 12)
  for (let i = 0; i < 9; i++) {
    const x = 225 + i * 44
    ctx.strokeStyle = `rgba(251,146,60,${0.25 + 0.25 * Math.sin(t * 3 + i)})`
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let k = 0; k <= 20; k++) {
      const yy = bedTop - 4 - k * 1.5
      const xx = x + Math.sin(k * 0.6 + t * 4 + i) * 3
      k === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy)
    }
    ctx.stroke()
  }
  label(ctx, 'CAMA CALEFACCIONADA 60–110 °C', 400, bedTop + 14, '#fecaca', 'center')

  // pieza depositada
  for (let k = 0; k < n; k++) {
    const age = n - k
    ctx.fillStyle = age < 2 ? '#fb923c' : age < 4 ? '#d97706' : '#64748b'
    ctx.fillRect(xl, bedTop - (k + 1) * LH, xr - xl, LH - 1)
  }
  if (finished) {
    ctx.fillStyle = '#64748b'
    ctx.fillRect(xl, bedTop - n * LH - LH, xr - xl, LH - 1)
  } else {
    // cordón de la capa actual, con retraso de flujo en Bowden
    const ex = dirR ? Math.max(xl, nx - (direct ? 0 : 8)) : Math.min(xr, nx + (direct ? 0 : 8))
    ctx.fillStyle = C.molten
    if (dirR) ctx.fillRect(xl, layerY, Math.max(0, ex - xl), LH - 1)
    else ctx.fillRect(ex, layerY, Math.max(0, xr - ex), LH - 1)
  }

  // presión / compresión de filamento
  const lag = direct ? 0.05 : 0.22
  const press = Math.abs(vel(u) - vel(clamp(u - lag))) * (direct ? 0.4 : 1.6)
  const blob = !direct && u > 0.82 && !finished ? (u - 0.82) / 0.18 : 0
  if (blob > 0) glow(ctx, dirR ? xr : xl, layerY + 3, 5 + blob * 8, '#fb923c')

  // pórtico
  ctx.fillStyle = C.dark
  ctx.strokeStyle = C.steel
  ctx.lineWidth = 1
  ctx.fillRect(110, 40, 14, 340)
  ctx.fillRect(676, 40, 14, 340)
  ctx.strokeRect(110.5, 40.5, 14, 340)
  ctx.strokeRect(676.5, 40.5, 14, 340)
  const beamY = ny - (direct ? 46 : 36)
  ctx.fillStyle = '#334155'
  ctx.fillRect(110, beamY - 6, 580, 8)
  label(ctx, 'Eje Z', 117, 392, C.text, 'left', 10)
  label(ctx, 'Eje X', 640, beamY - 16, C.text, 'right', 10)

  // carro + hot end
  const cw = direct ? 62 : 38
  ctx.fillStyle = '#475569'
  ctx.fillRect(nx - cw / 2, beamY - 8, cw, 30)
  if (direct) {
    // motor del extrusor montado en el carro
    ctx.fillStyle = '#0ea5e9'
    ctx.fillRect(nx - 30, beamY - 34, 40, 28)
    ctx.fillStyle = '#075985'
    ctx.beginPath()
    ctx.arc(nx + 16, beamY - 12, 9, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#e2e8f0'
    ctx.beginPath()
    ctx.moveTo(nx + 16, beamY - 3)
    ctx.lineTo(nx + 12, beamY + 22)
    ctx.stroke()
    label(ctx, 'Motor + engranaje (en el carro)', nx - 36, beamY - 46, '#7dd3fc', 'right', 10)
  }
  // bloque calefactor + boquilla
  const hy = beamY + 22
  ctx.fillStyle = '#b45309'
  ctx.fillRect(nx - 10, hy, 20, 14)
  ctx.fillStyle = '#d97706'
  ctx.beginPath()
  ctx.moveTo(nx - 10, hy + 14)
  ctx.lineTo(nx + 10, hy + 14)
  ctx.lineTo(nx + 2, ny)
  ctx.lineTo(nx - 2, ny)
  ctx.closePath()
  ctx.fill()
  glow(ctx, nx, ny, 12, C.molten, 0.8)
  label(ctx, 'HOT END 190–260 °C', 780, 20, '#fdba74', 'right', 10)

  // filamento y bobina
  ctx.fillStyle = '#334155'
  ctx.beginPath()
  ctx.arc(160, 80, 26, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#22d3ee'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(160, 80, 20, 0, Math.PI * 2)
  ctx.stroke()
  label(ctx, 'Bobina', 160, 52, C.text, 'center', 10)
  if (direct) {
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(186, 80)
    ctx.quadraticCurveTo(300, 80, nx - 14, beamY - 20)
    ctx.stroke()
  } else {
    // motor fijo al bastidor + tubo PTFE largo
    ctx.fillStyle = '#0ea5e9'
    ctx.fillRect(200, 62, 44, 36)
    ctx.fillStyle = '#075985'
    ctx.beginPath()
    ctx.arc(222, 80, 10, 0, Math.PI * 2)
    ctx.fill()
    label(ctx, 'Motor fijo al bastidor', 222, 112, '#7dd3fc', 'left', 10)
    const sx = 244
    const sy = 80
    const ex2 = nx
    const ey = beamY + 22
    const c1x = sx + 90
    const c1y = sy + 140 + Math.sin(t * 2) * 6
    const c2x = ex2 - 90
    const c2y = ey - 140
    const bez = (a, b, c, d, s) => (1 - s) ** 3 * a + 3 * (1 - s) ** 2 * s * b + 3 * (1 - s) * s * s * c + s ** 3 * d
    ctx.strokeStyle = 'rgba(148,163,184,0.45)'
    ctx.lineWidth = 9
    ctx.beginPath()
    for (let s = 0; s <= 1.001; s += 0.02) {
      const x = bez(sx, c1x, c2x, ex2, s)
      const y = bez(sy, c1y, c2y, ey, s)
      s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let s = 0; s <= 1.001; s += 0.02) {
      const wob = Math.sin(s * 40 + t * 8) * press * 2.2 * Math.sin(Math.PI * s)
      const x = bez(sx, c1x, c2x, ex2, s) + wob
      const y = bez(sy, c1y, c2y, ey, s) + wob
      s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
    label(ctx, 'Tubo PTFE (~600 mm de filamento comprimible)', 330, 196, '#cbd5e1', 'left', 10)
  }

  // medidor de presión
  ctx.fillStyle = '#0f172a'
  ctx.strokeStyle = '#334155'
  ctx.fillRect(40, 250, 16, 110)
  ctx.strokeRect(40.5, 250.5, 16, 110)
  const pv = clamp(press / 1.6)
  ctx.fillStyle = pv > 0.6 ? '#ef4444' : '#22d3ee'
  ctx.fillRect(42, 358 - 106 * pv, 12, 106 * pv)
  label(ctx, 'Presión', 48, 238, C.text, 'center', 10)
  label(ctx, 'filamento', 48, 249, C.text, 'center', 9)

  const info = direct
    ? { step: finished ? 'Capa terminada · enfriando' : `Capa ${n + 1}/${LAYERS} · Direct Drive`, detail: 'Camino de filamento corto: respuesta inmediata del flujo, retracción mínima.' }
    : { step: finished ? 'Capa terminada · enfriando' : `Capa ${n + 1}/${LAYERS} · Bowden`, detail: 'Cabezal liviano (alta aceleración) pero el filamento se comprime en el tubo: ooze y retraso de flujo.' }
  return info
}

// ───────────────────── 2. FUSIÓN DE LECHO DE POLVO SLS / SLM ─────────────────────
export function drawPBF(ctx, t, { metal }) {
  background(ctx)
  const TY = 235
  const CD = 170
  const T = 11
  const c = Math.floor(t / T) % 8
  const p = (t % T) / T
  const ph = p < 0.2 ? 0 : p < 0.5 ? 1 : p < 0.8 ? 2 : 3
  const sh = 10 * ease(seg(p, 0.8, 1))
  const cx = 400
  const bx0 = 290
  const bx1 = 510
  const fx0 = 100
  const fx1 = 230
  const ox0 = 580
  const ox1 = 680

  // estructura de cámaras
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(60, TY, 640, 12)
  ctx.fillStyle = '#0f172a'
  ;[
    [fx0, fx1],
    [bx0, bx1],
    [ox0, ox1],
  ].forEach(([a, b]) => {
    ctx.fillRect(a, TY, b - a, CD)
    ctx.strokeStyle = C.steel
    ctx.strokeRect(a + 0.5, TY + 0.5, b - a, CD)
  })
  ctx.fillStyle = C.bg
  ctx.fillRect(60, TY - 1, 640, 1)

  // pistón dosificador
  const feedY = TY + 75 - 8 * c - 8 * ease(seg(p, 0, 0.2))
  ctx.fillStyle = C.powder
  ctx.fillRect(fx0 + 1, feedY, fx1 - fx0 - 1, TY + CD - feedY)
  ctx.fillStyle = C.steelLight
  ctx.fillRect(fx0 + 1, feedY + 2, fx1 - fx0 - 1, 4)
  ctx.fillStyle = C.steel
  ctx.fillRect((fx0 + fx1) / 2 - 4, feedY + 6, 8, TY + CD - feedY)

  // rodillo
  const rp = ph === 1 ? ease(seg(p, 0.2, 0.5)) : ph === 3 ? 1 - ease(seg(p, 0.8, 1)) : ph === 2 ? 1 : 0
  const rx = lerp(110, 690, rp)
  const mound = 11 * ease(seg(p, 0, 0.2))
  const moundLeft = ph === 0 ? mound : ph === 1 ? 11 * (1 - seg(rx, fx0, fx1)) : 0
  if (moundLeft > 0.3) {
    ctx.fillStyle = C.powder
    ctx.beginPath()
    ctx.moveTo(fx0 + 8, TY)
    ctx.lineTo((fx0 + fx1) / 2, TY - moundLeft)
    ctx.lineTo(fx1 - 8, TY)
    ctx.closePath()
    ctx.fill()
  }

  // cama de polvo en cámara de construcción
  const topNow = (p >= 0.5 ? TY : TY + 10) + sh
  const platY = TY + 10 * (c + 1) + sh
  ctx.fillStyle = C.powder
  ctx.fillRect(bx0 + 1, topNow, bx1 - bx0 - 1, platY - topNow)
  if (ph === 1) {
    const fillTo = clamp(rx, bx0, bx1)
    ctx.fillRect(bx0 + 1, TY, Math.max(0, fillTo - bx0 - 1), 10)
  }
  // placa base y vástago
  ctx.fillStyle = '#64748b'
  ctx.fillRect(bx0 + 1, platY, bx1 - bx0 - 1, 12)
  ctx.fillStyle = C.steel
  ctx.fillRect(cx - 6, platY + 12, 12, TY + CD - platY - 12)

  // capas fusionadas (pieza)
  const wOf = (j) => 90 + 40 * Math.sin(j * 0.6 + 0.5)
  const fuse = ph === 2 ? seg(p, 0.5, 0.8) : ph === 3 ? 1 : 0
  for (let j = 0; j <= c; j++) {
    const y = TY + 10 * (c - j) + sh
    const w = wOf(j)
    if (j === c) {
      if (ph < 2) continue
      // capa recién escaneada: de polvo suelto a fusionada
      ctx.fillStyle = C.powder
      ctx.fillRect(cx - w / 2, y, w, 10)
      ctx.globalAlpha = fuse
      ctx.fillStyle = lerpColor(fuse)
      ctx.fillRect(cx - w / 2, y, w, 10)
      ctx.globalAlpha = 1
    } else {
      const age = c - j
      ctx.fillStyle = age < 2 ? '#c2763a' : '#94a3b8'
      ctx.fillRect(cx - wOf(j) / 2, y, wOf(j), 10)
      ctx.strokeStyle = 'rgba(15,23,42,0.5)'
      ctx.strokeRect(cx - wOf(j) / 2 + 0.5, y + 0.5, wOf(j) - 1, 9)
    }
  }

  // desborde
  const ovTop = TY + CD - 12 - 7 * c
  ctx.fillStyle = C.powder
  ctx.fillRect(ox0 + 1, ovTop, ox1 - ox0 - 1, TY + CD - ovTop)

  // rodillo dibujado encima
  ctx.fillStyle = '#cbd5e1'
  ctx.beginPath()
  ctx.arc(rx, TY - 9, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 2
  ctx.beginPath()
  const ra = -rx / 9
  ctx.moveTo(rx, TY - 9)
  ctx.lineTo(rx + Math.cos(ra) * 9, TY - 9 + Math.sin(ra) * 9)
  ctx.stroke()
  ctx.lineWidth = 1

  // láser
  ctx.fillStyle = '#334155'
  ctx.fillRect(cx - 28, 40, 56, 30)
  ctx.strokeStyle = '#64748b'
  ctx.strokeRect(cx - 27.5, 40.5, 56, 30)
  label(ctx, metal ? 'LÁSER FIBRA (Yb)' : 'LÁSER CO₂', cx, 55, '#fda4af', 'center', 10)
  if (ph === 2) {
    const u = seg(p, 0.5, 0.8)
    const w = wOf(c)
    const sx = cx - w / 2 + w * tri(u * 3)
    ctx.strokeStyle = metal ? 'rgba(244,63,94,0.9)' : 'rgba(251,113,133,0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx, 70)
    ctx.lineTo(sx, TY)
    ctx.stroke()
    ctx.lineWidth = 1
    glow(ctx, sx, TY + 4, 16, '#fb923c')
    glow(ctx, sx, TY + 4, 6, '#fff', 0.9)
  }

  // etiquetas
  label(ctx, 'Pistón dosificador', (fx0 + fx1) / 2, TY + CD + 16, C.text, 'center', 10)
  leader(ctx, rx, TY - 18, rx, 150, 'Rodillo / recubridor', '#e2e8f0', 'center')
  label(ctx, 'Plataforma de construcción', cx, TY + CD + 16, C.text, 'center', 10)
  label(ctx, 'Cama de polvo = soporte natural', bx1 + 8, TY + 60, '#fde68a', 'left', 10)
  label(ctx, metal ? 'Placa base: SOPORTES SOLDADOS' : 'Sin soportes ni anclajes', bx1 + 8, TY + 76, '#fde68a', 'left', 10)
  label(ctx, 'Desborde', (ox0 + ox1) / 2, TY + CD + 16, C.text, 'center', 10)
  label(ctx, metal ? 'Atmósfera inerte Ar / N₂ · O₂ < 0,1 %' : 'Cámara precalentada ~ T de fusión − 10 °C', 780, 44, '#67e8f9', 'right', 10)

  chips(ctx, ['1 Dosificación', '2 Recubrimiento', '3 Escaneo láser', '4 Descenso'], ph)
  label(ctx, `Capa ${c + 1}/8`, 780, 64, C.text, 'right')

  const infos = [
    'El pistón dosificador sube y forma un montículo de polvo sobre la mesa.',
    'El rodillo barre y compacta una capa uniforme; el sobrante cae al desborde.',
    metal
      ? 'El láser funde la sección (SLM): el baño líquido solidifica y genera tensiones residuales.'
      : 'El láser sinteriza la sección (SLS) sobre polvo precalentado: sin tensiones graves.',
    'La plataforma desciende un espesor de capa; el ciclo se repite.',
  ]
  return { step: ['Dosificación', 'Recubrimiento', 'Escaneo láser', 'Descenso de plataforma'][ph], detail: infos[ph] }
}

function lerpColor(f) {
  // naranja incandescente -> gris azulado frío
  const r = Math.round(lerp(251, 148, f > 0.85 ? (f - 0.85) / 0.15 : 0))
  const g = Math.round(lerp(146, 163, f > 0.85 ? (f - 0.85) / 0.15 : 0))
  const b = Math.round(lerp(60, 184, f > 0.85 ? (f - 0.85) / 0.15 : 0))
  return `rgb(${r},${g},${b})`
}

// ───────────────────── 3. FOTOPOLIMERIZACIÓN SLA vs CLIP ─────────────────────
export function drawVAT(ctx, t, { clip }) {
  background(ctx)
  const win = 372 // cara superior de la ventana
  const vx0 = 230
  const vx1 = 570
  const cx = 400
  const pw = 100 // ancho de pieza
  const MAXL = 160
  let bottom
  let L
  let phase = 0
  let phaseName = ''
  let force = 0
  let beam = false

  if (!clip) {
    const T = 3.4
    const n = Math.floor(t / T) % 16
    const p = (t % T) / T
    L = 10 * (n + 1)
    if (p < 0.38) {
      phase = 0
      bottom = win
      beam = true
      phaseName = 'Exposición de la capa'
    } else if (p < 0.68) {
      phase = 1
      const e = ease(seg(p, 0.38, 0.68))
      bottom = win - 34 * e
      force = Math.sin(Math.PI * Math.min(1, e * 1.4)) * (e < 0.7 ? 1 : 0.3)
      phaseName = 'Despegue (peel)'
    } else {
      phase = 2
      bottom = win - 34 + 24 * ease(seg(p, 0.68, 1))
      phaseName = 'Retorno · recarga de resina'
    }
  } else {
    const T = 10
    const q = (t % T) / T
    L = 8 + 150 * clamp(q / 0.92)
    bottom = win - 14
    phase = 3
    beam = true
    phaseName = 'Curado continuo'
  }

  const platBottom = bottom - L
  const platTop = platBottom - 12

  // cuba
  ctx.fillStyle = '#0c4a6e'
  ctx.globalAlpha = 0.55
  ctx.fillRect(vx0 + 4, 262, vx1 - vx0 - 8, win + 8 - 262)
  ctx.globalAlpha = 1
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(vx0, 240)
  ctx.lineTo(vx0, win + 12)
  ctx.lineTo(vx1, win + 12)
  ctx.lineTo(vx1, 240)
  ctx.stroke()
  ctx.lineWidth = 1
  // ventana inferior
  ctx.fillStyle = clip ? '#134e4a' : '#bae6fd'
  ctx.globalAlpha = 0.7
  ctx.fillRect(vx0 + 50, win, vx1 - vx0 - 100, 10)
  ctx.globalAlpha = 1
  label(ctx, clip ? 'Ventana permeable a O₂ (Teflon AF)' : 'Ventana transparente UV + film FEP', vx0 + 50, win + 24, '#7dd3fc', 'left', 10)
  label(ctx, 'Resina fotocurable líquida', vx0 + 12, 280, '#7dd3fc', 'left', 10)
  label(ctx, 'Cuba', vx0 - 8, 300, C.text, 'right', 10)

  // proyector / láser
  ctx.fillStyle = '#334155'
  ctx.fillRect(cx - 55, 408, 110, 26)
  ctx.strokeStyle = '#64748b'
  ctx.strokeRect(cx - 54.5, 408.5, 110, 26)
  label(ctx, clip ? 'PROYECTOR UV (DLP)' : 'LÁSER UV + GALVO / DLP', cx, 421, '#c4b5fd', 'center', 10)

  // haz UV
  if (beam) {
    const g = ctx.createLinearGradient(0, 408, 0, win)
    g.addColorStop(0, 'rgba(167,139,250,0.55)')
    g.addColorStop(1, 'rgba(167,139,250,0.15)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(cx - 20, 408)
    ctx.lineTo(cx + 20, 408)
    ctx.lineTo(cx + pw / 2, win + 10)
    ctx.lineTo(cx - pw / 2, win + 10)
    ctx.closePath()
    ctx.fill()
    if (!clip) {
      const sx = cx - pw / 2 + pw * tri(t * 1.6)
      glow(ctx, sx, win, 14, '#e9d5ff')
    }
  }

  // zona muerta (CLIP)
  if (clip) {
    ctx.fillStyle = 'rgba(16,185,129,0.35)'
    ctx.fillRect(vx0 + 50, win - 14, vx1 - vx0 - 100, 14)
    ctx.strokeStyle = '#34d399'
    ctx.setLineDash([4, 3])
    ctx.strokeRect(vx0 + 50.5, win - 13.5, vx1 - vx0 - 100, 14)
    ctx.setLineDash([])
    // O2 subiendo
    for (let i = 0; i < 14; i++) {
      const x = vx0 + 70 + i * 19
      const yy = win + 10 - ((t * 20 + i * 7) % 24)
      ctx.fillStyle = '#6ee7b7'
      ctx.beginPath()
      ctx.arc(x, yy, 1.8, 0, Math.PI * 2)
      ctx.fill()
    }
    // flujo lateral de resina fresca
    ctx.strokeStyle = '#7dd3fc'
    ctx.beginPath()
    ;[-1, 1].forEach((d) => {
      const x0 = cx + d * 140
      ctx.moveTo(x0, win - 7)
      ctx.lineTo(cx + d * (pw / 2 + 8), win - 7)
    })
    ctx.stroke()
    leader(ctx, vx1 - 40, win - 7, vx1 + 14, win - 40, 'ZONA MUERTA ~ 25–50 µm', '#6ee7b7')
    label(ctx, 'O₂ inhibe el curado', vx1 + 18, win - 26, '#6ee7b7', 'left', 10)
    label(ctx, '→ sin adhesión ni despegue', vx1 + 18, win - 12, '#6ee7b7', 'left', 10)
  }

  // pieza
  if (L > 0) {
    const pg = ctx.createLinearGradient(0, platBottom, 0, bottom)
    pg.addColorStop(0, '#f1f5f9')
    pg.addColorStop(1, clip ? '#a78bfa' : '#c4b5fd')
    ctx.fillStyle = pg
    ctx.fillRect(cx - pw / 2, platBottom, pw, bottom - platBottom)
    // capas visibles en SLA
    if (!clip) {
      ctx.strokeStyle = 'rgba(30,41,59,0.35)'
      for (let y = bottom - 10; y > platBottom; y -= 10) {
        ctx.beginPath()
        ctx.moveTo(cx - pw / 2, y)
        ctx.lineTo(cx + pw / 2, y)
        ctx.stroke()
      }
    }
    if (beam) glow(ctx, cx, bottom - 3, pw * 0.7, '#c4b5fd', 0.5)
  }
  // despegue: estiramiento
  if (!clip && phase === 1) {
    ctx.strokeStyle = '#f87171'
    ctx.lineWidth = 2
    for (let i = 0; i < 5; i++) {
      const x = cx - pw / 2 + 10 + i * ((pw - 20) / 4)
      ctx.beginPath()
      ctx.moveTo(x, bottom)
      ctx.lineTo(x, win)
      ctx.stroke()
    }
    ctx.lineWidth = 1
  }

  // plataforma y brazo
  ctx.fillStyle = C.steelLight
  ctx.fillRect(cx - 70, platTop, 140, 12)
  ctx.fillStyle = C.steel
  ctx.fillRect(cx - 5, 40, 10, platTop - 40)
  ctx.fillStyle = C.dark
  ctx.fillRect(cx - 40, 24, 80, 18)
  ctx.strokeStyle = C.steel
  ctx.strokeRect(cx - 39.5, 24.5, 80, 18)
  label(ctx, 'Eje Z', cx, 33, C.text, 'center', 10)
  leader(ctx, cx + 70, platTop + 6, cx + 130, platTop - 14, 'Plataforma de construcción', C.text)

  // medidor de fuerza de despegue
  ctx.fillStyle = '#0f172a'
  ctx.strokeStyle = '#334155'
  ctx.fillRect(46, 150, 16, 150)
  ctx.strokeRect(46.5, 150.5, 16, 150)
  ctx.fillStyle = force > 0.5 ? '#ef4444' : '#22d3ee'
  ctx.fillRect(48, 298 - 146 * force, 12, 146 * force)
  label(ctx, 'Fuerza de', 54, 130, C.text, 'center', 10)
  label(ctx, 'despegue', 54, 141, C.text, 'center', 10)
  label(ctx, clip ? '≈ 0' : force > 0.05 ? 'PICO' : 'bajo', 54, 312, clip ? '#6ee7b7' : '#fca5a5', 'center', 10)

  chips(ctx, clip ? ['CLIP · curado continuo'] : ['1 Exposición', '2 Despegue', '3 Retorno'], clip ? 0 : phase)
  label(ctx, clip ? 'Velocidad ≈ constante, sin paradas mecánicas' : 'Ciclo "stop & go" por capa', 700, 26, '#67e8f9', 'right', 10)

  return {
    step: phaseName,
    detail: clip
      ? 'La película de resina sin curar sobre la ventana (zona muerta) evita que la pieza se pegue: la plataforma sube sin detenerse.'
      : [
          'El UV cura una capa de resina contra la ventana y la adhiere a la pieza.',
          'La plataforma sube para despegar la capa del film: se genera el pico de fuerza (riesgo de deformación).',
          'La plataforma vuelve a bajar dejando un espesor de capa de resina fresca.',
        ][phase],
  }
}

// ───────────────────── 4. DED / HÍBRIDO ADITIVO-SUSTRACTIVO ─────────────────────
export function drawDED(ctx, t) {
  background(ctx)
  const T = 14
  const tt = t % T
  const baseY = 380
  const x0 = 340
  const x1 = 460
  const yFill = 232
  const yFinal = 240
  const yw = (x) => 266 + 12 * Math.exp(-(((x - 400) / 28) ** 2)) - 0.04 * Math.abs(x - 400) // punta desgastada
  const ripple = (x, k) => 3 * Math.sin(x * 0.45 + k)

  const depEnd = 8.4
  const millEnd = 12
  const inDep = tt < depEnd
  const inMill = !inDep && tt < millEnd
  const passDur = depEnd / 4
  const k = Math.min(3, Math.floor(tt / passDur))
  const u = (tt % passDur) / passDur
  const dirR = k % 2 === 0
  const headX = inDep ? (dirR ? lerp(x0 - 6, x1 + 6, ease(u)) : lerp(x1 + 6, x0 - 6, ease(u))) : 0
  const mu = inMill ? seg(tt, depEnd + 0.4, millEnd - 0.4) : tt >= millEnd ? 1 : 0
  const millX = lerp(x0 - 10, x1 + 10, mu)

  // altura de la superficie por columna
  const surf = (x) => {
    if (inDep) {
      const passed = dirR ? headX >= x : headX <= x
      const f = (k + (passed ? 1 : 0)) / 4
      return lerp(yw(x), yFill + ripple(x, 0), f)
    }
    const full = yFill + ripple(x, 0)
    if (inMill || tt >= millEnd) return x <= millX ? Math.max(full, yFinal) : full
    return full
  }

  // mesa rotativa / basculante
  ctx.fillStyle = C.dark
  ctx.fillRect(250, baseY, 300, 22)
  ctx.strokeStyle = C.steel
  ctx.strokeRect(250.5, baseY + 0.5, 300, 22)
  ctx.fillStyle = '#334155'
  ctx.fillRect(220, baseY + 22, 360, 16)
  label(ctx, 'Mesa rotativa / basculante (ejes A-C)', 400, baseY + 50, C.text, 'center', 10)
  // pieza base
  ctx.fillStyle = '#64748b'
  ctx.fillRect(x0, yw(x0) + 30, x1 - x0, baseY - yw(x0) - 30)
  ctx.beginPath()
  ctx.moveTo(x0, baseY)
  for (let x = x0; x <= x1; x += 2) ctx.lineTo(x, Math.min(baseY, yw(x)))
  ctx.lineTo(x1, baseY)
  ctx.closePath()
  ctx.fill()
  // material aportado / superficie actual
  ctx.beginPath()
  ctx.moveTo(x0, yw(x0))
  for (let x = x0; x <= x1; x += 2) ctx.lineTo(x, surf(x))
  for (let x = x1; x >= x0; x -= 2) ctx.lineTo(x, yw(x))
  ctx.closePath()
  const dg = ctx.createLinearGradient(0, 230, 0, 270)
  dg.addColorStop(0, '#e2e8f0')
  dg.addColorStop(1, '#f59e0b')
  ctx.fillStyle = dg
  ctx.fill()
  // contorno nominal
  ctx.strokeStyle = 'rgba(34,211,238,0.6)'
  ctx.setLineDash([5, 4])
  ctx.beginPath()
  ctx.moveTo(x0 - 20, yFinal)
  ctx.lineTo(x1 + 20, yFinal)
  ctx.stroke()
  ctx.setLineDash([])
  label(ctx, 'Cota nominal CAD', x1 + 26, yFinal, '#67e8f9', 'left', 10)
  leader(ctx, x0 + 4, 300, 230, 310, 'Álabe base (punta desgastada)', C.text, 'right')

  // cabezales
  const tilt = 0.18 * Math.sin(t * 0.9)
  const nozzleX = inDep ? headX : 150
  const nozzleY = inDep ? surf(clamp(headX, x0, x1)) - 14 : 120
  const millActive = inMill
  const spX = millActive ? millX : 650
  const spY = millActive ? yFinal : 130

  // portico
  ctx.fillStyle = C.dark
  ctx.fillRect(60, 40, 680, 14)
  ctx.strokeStyle = C.steel
  ctx.strokeRect(60.5, 40.5, 680, 14)
  label(ctx, 'Cabezal 5 ejes', 70, 66, C.text, 'left', 10)

  // boquilla coaxial
  ctx.save()
  ctx.translate(nozzleX, nozzleY)
  ctx.rotate(inDep ? tilt : 0)
  ctx.fillStyle = '#475569'
  ctx.fillRect(-14, -(inDep ? 130 : 20) - 20, 28, 20)
  ctx.fillStyle = '#334155'
  ctx.beginPath()
  ctx.moveTo(-18, -(inDep ? 130 : 20))
  ctx.lineTo(18, -(inDep ? 130 : 20))
  ctx.lineTo(4, 0)
  ctx.lineTo(-4, 0)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#64748b'
  ctx.stroke()
  if (inDep) {
    // haz láser focalizado
    ctx.strokeStyle = 'rgba(244,63,94,0.9)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, -130)
    ctx.lineTo(0, 12)
    ctx.stroke()
    ctx.lineWidth = 1
    // chorros de polvo
    for (let i = 0; i < 12; i++) {
      const s = ((t * 1.4 + i / 6) % 1)
      ;[-1, 1].forEach((d) => {
        const x = d * lerp(14, 0, s)
        const y = lerp(-26, 12, s)
        ctx.fillStyle = '#fde68a'
        ctx.beginPath()
        ctx.arc(x, y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      })
    }
    glow(ctx, 0, 12, 22, '#fb923c')
    glow(ctx, 0, 12, 7, '#fff', 0.95)
    label(ctx, 'Gas de protección (Ar)', -22, -60, '#7dd3fc', 'right', 10)
    label(ctx, 'Polvo metálico', 24, -42, '#fde68a', 'left', 10)
    label(ctx, 'Haz láser', 12, -90, '#fda4af', 'left', 10)
  }
  ctx.restore()
  if (!inDep) label(ctx, 'Boquilla coaxial (estacionada)', 150, 150, C.text, 'center', 10)

  // fresa
  ctx.fillStyle = '#475569'
  ctx.fillRect(spX - 22, 54, 44, 62)
  ctx.fillRect(spX - 9, 116, 18, 18)
  ctx.fillStyle = '#cbd5e1'
  ctx.fillRect(spX - 9, 134, 18, Math.max(0, spY - 134))
  if (millActive) {
    ctx.strokeStyle = '#475569'
    for (let i = 0; i < 6; i++) {
      const yy = 138 + ((i * 18 + t * 120) % 100)
      if (yy < spY) {
        ctx.beginPath()
        ctx.moveTo(spX - 9, yy)
        ctx.lineTo(spX + 9, yy - 6)
        ctx.stroke()
      }
    }
    for (let i = 0; i < 10; i++) {
      const s = (t * 1.8 + i * 0.37) % 1
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(millX + (i % 2 ? 1 : -1) * s * 24, spY - s * 22 + s * s * 40, 2, 2)
    }
    label(ctx, 'Fresa CNC · acabado', spX + 24, 150, '#a5f3fc', 'left', 10)
  } else {
    label(ctx, 'Husillo + fresa (estacionado)', spX, 150, C.text, 'center', 10)
  }

  chips(ctx, ['Aporte DED (4 pasadas)', 'Fresado de terminación'], inDep ? 0 : 1)
  label(ctx, inDep ? `Pasada ${k + 1}/4 · baño fundido in-situ` : tt < millEnd ? 'Remoción de sobre-espesor · Ra ↓' : 'Pieza recuperada · inspección', 700, 26, '#67e8f9', 'right', 10)

  return {
    step: inDep ? `Aporte DED · pasada ${k + 1}/4` : tt < millEnd ? 'Fresado CNC de terminación' : 'Inspección',
    detail: inDep
      ? 'El polvo se inyecta coaxial al haz y se funde in-situ sobre la pieza base; la rugosidad y el sobre-espesor son altos (as-built).'
      : tt < millEnd
        ? 'La fresa elimina el sobre-espesor y restituye la cota nominal con tolerancia de mecanizado (ciclo híbrido).'
        : 'Se verifica el perfil recuperado contra el CAD antes de reiniciar el ciclo.',
  }
}
