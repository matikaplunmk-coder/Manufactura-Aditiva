// Motor de decisión (didáctico) basado en las categorías de proceso de ISO/ASTM 52900.
export const MATERIALS = [
  { id: 'thermo', label: 'Termoplástico estándar', sub: 'PLA / ABS' },
  { id: 'tech', label: 'Polímero técnico', sub: 'PA12, PEEK' },
  { id: 'resin', label: 'Resina fotocurable', sub: 'Acrílica / epoxi / dual cure' },
  { id: 'metal', label: 'Metal', sub: 'Acero inox / Inconel / Titanio' },
  { id: 'sand', label: 'Arena / Cerámico', sub: 'Moldes, noyos, cerámica técnica' },
]
export const LOADS = [
  { id: 'aesthetic', label: 'Modelo estético / ergonómico' },
  { id: 'functional', label: 'Pieza funcional, esfuerzos moderados' },
  { id: 'critical', label: 'Componente crítico: alta fatiga / estructural' },
]
export const GEOMETRIES = [
  { id: 'channels', label: 'Canales internos (refrigeración conformada)' },
  { id: 'consolidated', label: 'Múltiples piezas consolidadas en una' },
  { id: 'thin', label: 'Paredes delgadas' },
  { id: 'large', label: 'Formato grande (> 500 mm)' },
]
export const FINISHES = [
  { id: 'precise', label: 'Alta precisión superficial (Ra < 3 µm)' },
  { id: 'coarse', label: 'Tolerancia basta admisible' },
]

export const FAMILIES = [
  'Material Extrusion',
  'Powder Bed Fusion',
  'Vat Photopolymerization',
  'Binder Jetting',
  'Directed Energy Deposition',
  'Material Jetting',
  'Sheet Lamination',
]

const step = (name, why) => ({ name, why })

export function recommend({ material, load, geo, finish }) {
  const has = (g) => geo.includes(g)
  const precise = finish === 'precise'
  const warnings = []
  let r

  if (material === 'thermo') {
    const soluble = has('channels') || has('consolidated') || has('thin')
    r = {
      tech: 'FDM / FFF',
      family: 'Material Extrusion',
      why: [
        'PLA/ABS se procesan como filamento: menor costo de equipo e insumo.',
        has('large') ? 'El formato grande (> 500 mm) es la fortaleza de la extrusión: sin cámara de polvo ni cuba que limite el volumen.' : 'Ideal para iterar prototipos y dispositivos de ensayo con bajo costo por pieza.',
      ],
      support: soluble
        ? { type: 'soluble', title: 'Soportes solubles (PVA / BVOH / HIPS)', text: 'Con canales o geometría consolidada los soportes rompibles no son accesibles: se usa un segundo extrusor con material soluble que se disuelve en baño de agua o limoneno.' }
        : { type: 'breakaway', title: 'Soportes rompibles del mismo material', text: 'Estructuras de baja densidad con interfaz débil. Se retiran manualmente; dejan marcas en la cara apoyada.' },
      zRatio: 50,
      isoNote: 'Adhesión interlaminar por difusión térmica: la resistencia en Z es ~ 40–60 % de la de XY.',
      chain: [
        soluble ? step('Disolución de soportes', 'Baño con agitación (agua para PVA/BVOH, limoneno para HIPS).') : step('Retiro manual de soportes', 'Corte/pinza; evitar dañar la cara apoyada.'),
        step('Lijado progresivo', 'Grano 120 → 400 para eliminar el escalonado.'),
        step(precise ? 'Alisado por vapor (ABS) / imprimación' : 'Limpieza e inspección dimensional', precise ? 'El vapor de acetona funde la piel y reduce Ra; el PLA requiere imprimación y masilla.' : 'Control con calibre; compensar contracción.'),
        ...(precise ? [step('Mecanizado / escariado de asientos', 'Los orificios FDM salen sub-medida: se escarían a tolerancia.')] : []),
      ],
    }
    if (precise) warnings.push('Ra < 3 µm no se obtiene en FDM as-built (Ra típica 10–25 µm): se logra solo con postproceso.')
    if (load === 'critical') warnings.push('PLA/ABS no son aptos para solicitaciones críticas ni fatiga: considerar polímero técnico (PA-CF, PEEK) o metal.')
  } else if (material === 'tech') {
    if (has('large') && !has('channels')) {
      r = {
        tech: 'FDM de alta temperatura (PEEK / ULTEM)',
        family: 'Material Extrusion',
        why: ['El formato grande excede el volumen habitual de las cámaras de polvo (≈ 300–400 mm).', 'Cámara y cama calefaccionadas permiten PEEK con buena cristalinidad.'],
        support: { type: 'soluble', title: 'Soportes solubles o de alta temperatura', text: 'Soportes del mismo polímero rompibles o materiales solubles compatibles con la temperatura de proceso (> 350 °C en PEEK).' },
        zRatio: 60,
        isoNote: 'Con cámara caliente mejora la fusión entre capas, pero Z sigue siendo ~ 55–70 % de XY.',
        chain: [step('Enfriamiento controlado en cámara', 'Evita alabeo y garantiza cristalinidad del PEEK.'), step('Retiro de soportes', 'Rompibles o disolución.'), step('Recocido (annealing)', 'Maximiza cristalinidad y alivia tensiones.'), step('Mecanizado CNC de asientos', 'Tolerancias funcionales H7.')],
      }
    } else {
      const mjf = precise || has('consolidated') || has('thin')
      r = {
        tech: mjf ? 'MJF / SLS (PA12)' : 'SLS (PA12 / PEEK)',
        family: 'Powder Bed Fusion',
        why: [
          'El lecho de polvo no necesita soportes: permite canales internos, ensambles consolidados y encastres sin ensamblar.',
          'PA12 sinterizado alcanza 90–95 % de isotropía y buena resistencia a fatiga.',
          has('thin') ? 'Paredes mínimas de ~ 0,6–0,8 mm viables si el polvo evacúa sin quedar atrapado.' : 'Alta productividad al anidar decenas de piezas en el volumen de construcción.',
        ],
        support: { type: 'powder', title: 'La cama de polvo es el soporte natural', text: 'El polvo no fusionado sostiene voladizos y paredes. No hay anclajes: se aprovecha el volumen anidando piezas en 3D. Los canales internos deben tener salidas para evacuar el polvo.' },
        zRatio: 90,
        isoNote: 'Fusión capa a capa de un volumen precalentado: anisotropía baja (Z ≈ 90–95 % de XY).',
        chain: [
          step('Enfriamiento controlado', 'El "cake" se enfría lento en cámara (horas) para evitar alabeo.'),
          step('Retiro y reciclaje de polvo', 'Desempolvado y tamizado; mezcla con polvo virgen (≈ 30–50 %).'),
          step('Granallado con microesferas', 'Elimina polvo adherido y homogeneiza la rugosidad.'),
          ...(precise ? [step('Alisado químico / vibrado', 'Reduce Ra y sella la porosidad superficial.')] : [step('Tintura (opcional)', 'Color uniforme o negro para uso técnico.')]),
          ...(load !== 'aesthetic' ? [step('Mecanizado CNC de roscas/asientos', 'Roscas y ajustes críticos se mecanizan; no confiar en la tolerancia as-built (± 0,3 mm).')] : []),
        ],
      }
      if (load === 'critical') warnings.push('Para fatiga crítica con polímeros evaluar PEEK o PA-CF; o pasar a metal (SLM) si hay temperatura o esfuerzo elevado.')
    }
  } else if (material === 'resin') {
    r = {
      tech: has('large') ? 'SLA gran formato' : precise || has('thin') ? 'SLA / DLP de alta resolución' : 'SLA / CLIP',
      family: 'Vat Photopolymerization',
      why: [
        'Mejor resolución y acabado superficial de todas las familias (Ra típica 0,8–2 µm con capas de 25–50 µm).',
        has('channels') ? 'Los canales internos son posibles si hay vías de drenaje para la resina líquida.' : 'Ideal para master patterns, modelos de joyería, dental y piezas de precisión.',
      ],
      support: { type: 'photo', title: 'Soportes puntiformes del mismo fotopolímero', text: 'La pieza cuelga de la plataforma: los voladizos y las islas necesitan puntales finos. Resisten la fuerza de despegue de cada capa y se cortan al final dejando pequeñas marcas.' },
      zRatio: 90,
      isoNote: 'Reticulación química entre capas: casi isótropa tras poscurado, pero frágil (alargamiento < 10 %).',
      chain: [
        step('Drenaje de resina', 'Escurrir sobre la plataforma para recuperar resina líquida.'),
        step('Lavado en alcohol isopropílico (IPA)', 'Elimina resina sin curar de superficies y canales.'),
        step('Retiro de soportes', 'Corte al ras con pinza antes del poscurado (la pieza aún es blanda).'),
        step('Poscurado UV + térmico', 'Completa la conversión y define propiedades mecánicas finales.'),
        step(precise ? 'Pulido / lijado fino' : 'Lijado y pintado (opcional)', 'Elimina marcas de soportes.'),
      ],
    }
    if (load === 'critical') warnings.push('Las resinas estándar son frágiles y degradan con UV/humedad: no recomendadas para componentes de alta fatiga.')
    if (has('large')) warnings.push('Los equipos SLA llegan a ~ 800 mm solo en máquinas industriales; verificar volumen y contracción.')
  } else if (material === 'metal') {
    if (has('large')) {
      r = {
        tech: 'DED (WAAM / láser coaxial)',
        family: 'Directed Energy Deposition',
        why: ['La deposición dirigida no tiene cámara de polvo: piezas de metros y altas tasas (1–10 kg/h).', 'Permite reparar o recargar piezas existentes y gradientes de material.'],
        support: { type: 'none', title: 'Sin soportes; pieza sobre sustrato', text: 'Se deposita sobre un sustrato metálico y la geometría se limita a ángulos auto-portantes (o cabezal 5 ejes). Los canales internos complejos no son factibles.' },
        zRatio: 88,
        isoNote: 'Microestructura columnar con crecimiento epitaxial: propiedades dependientes de la dirección (Z ≈ 85–95 % de XY).',
        chain: [
          step('Enfriamiento controlado', 'Evita fisuración por gradientes térmicos.'),
          step('Alivio de tensiones en horno', 'Reduce tensiones residuales antes de liberar la pieza.'),
          step('Corte del sustrato (EDM / sierra)', 'Separación de la placa base.'),
          step('Mecanizado CNC de terminación', 'Ra as-built 10–50 µm: se fresa a cota final.'),
          ...(load === 'critical' ? [step('HIP + tratamiento térmico', 'Cierra porosidad interna y homogeniza microestructura.')] : []),
        ],
      }
      if (has('channels')) warnings.push('DED no resuelve canales internos conformados: dividir la pieza o combinar con SLM.')
    } else if (load === 'aesthetic' && !has('channels')) {
      r = {
        tech: 'Binder Jetting metálico',
        family: 'Binder Jetting',
        why: ['Sin láser ni soportes: costo por pieza bajo en series medias.', 'Para modelos o piezas con solicitación baja no se justifica el costo del SLM.'],
        support: { type: 'powder', title: 'La cama de polvo sostiene la pieza "en verde"', text: 'Sin anclajes ni tensiones residuales de fusión; el soporte lo cumple el polvo, pero la pieza en verde es frágil y se sinteriza después con soporte cerámico.' },
        zRatio: 95,
        isoNote: 'Tras sinterizado la pieza es casi isótropa, pero con porosidad residual (95–98 % de densidad).',
        chain: [step('Curado del binder', 'Endurece la pieza en verde.'), step('Retiro y reciclaje de polvo', 'Desempolvado cuidadoso.'), step('Debinding térmico', 'Elimina el aglutinante.'), step('Sinterizado en horno', 'Contracción 15–20 %: compensada en el CAD.'), step('Chorro de arena / Pulido', 'Acabado estético.')],
      }
    } else {
      r = {
        tech: 'SLM / DMLS',
        family: 'Powder Bed Fusion',
        why: [
          'Fusión completa del metal con láser de fibra: densidad > 99,5 % y propiedades comparables a forjado tras tratamiento.',
          has('channels') ? 'La refrigeración conformada y los canales internos son la aplicación estrella: imposibles por mecanizado o fundición.' : 'Libertad geométrica para topologías optimizadas y aligeramiento.',
          has('consolidated') ? 'La consolidación reduce uniones soldadas/atornilladas y puntos de falla.' : 'Resolución de detalle de 0,3–0,5 mm.',
        ],
        support: { type: 'welded', title: 'Soportes soldados del mismo material', text: 'El metal funde y solidifica con fuertes gradientes: los soportes anclan la pieza a la placa base para resistir las tensiones residuales (evitan deformación y delaminación) y disipan calor hacia la placa. Se retiran por EDM de hilo / mecanizado.' },
        zRatio: 97,
        isoNote: 'Tras alivio de tensiones/HIP la anisotropía es baja; as-built puede haber diferencia por textura de grano (Z ≈ 95 % de XY, con menor ductilidad en Z).',
        chain: [
          step('Enfriamiento controlado en cámara', 'Evita choques térmicos con la pieza aún caliente.'),
          step('Retiro y reciclaje de polvo', 'Aspirado y tamizado en ambiente inerte (polvo reactivo).'),
          step('Alivio de tensiones en horno', 'Con la pieza aún soldada a la placa base, para que no se deforme al cortar.'),
          step('Corte por electroerosión (EDM) de soportes', 'Separación de la placa base sin esfuerzos mecánicos.'),
          ...(load === 'critical' ? [step('HIP (prensado isostático en caliente)', 'Cierra poros internos y mejora vida a fatiga.')] : []),
          step('Mecanizado CNC de roscas/asientos', 'Asientos de rodamiento, sellos y roscas a tolerancia.'),
          step('Chorro de arena / Pulido', precise ? 'Pulido hasta Ra < 3 µm (superficie interna: abrasivo fluido AFM).' : 'Granallado para uniformar la rugosidad (Ra 6–12 µm).'),
        ],
      }
      if (has('large')) warnings.push('Formato grande: excede el volumen de la mayoría de SLM (250–400 mm).')
    }
  } else {
    r = {
      tech: 'Binder Jetting (arena / cerámica)',
      family: 'Binder Jetting',
      why: ['Impresión en frío sin láser: velocidad y volúmenes grandes (> 1 m en arena furánica).', 'Aplicación típica: moldes y noyos de fundición con canales complejos sin ensamblar.'],
      support: { type: 'powder', title: 'La cama de polvo es el soporte natural', text: 'La arena/cerámica circundante sostiene todo sin anclajes. Debe preverse la evacuación del polvo por los canales.' },
      zRatio: 90,
      isoNote: 'Pieza en verde cohesionada por binder: isotropía aceptable, pero baja resistencia mecánica y fragilidad.',
      chain: [step('Curado del binder', 'Furánico / inorgánico.'), step('Retiro y reciclaje de arena', 'Desempolvado; la arena se regenera.'), step('Recubrimiento refractario / Infiltración', 'Mejora la superficie del molde o densifica la cerámica.'), step(load === 'aesthetic' ? 'Sellado' : 'Sinterizado / colada', load === 'aesthetic' ? 'Barniz para modelos.' : 'Cerámica: sinterizado; arena: colada del metal fundido.')],
    }
    if (load === 'critical') warnings.push('La cerámica/arena en verde no soporta cargas estructurales: se usan como molde para fundir el componente metálico o como cerámica técnica sinterizada.')
  }
  return { ...r, warnings }
}
