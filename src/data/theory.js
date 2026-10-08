// Material teórico de la cátedra (Tecnología de Fabricación · UTN-FRC) sobre Manufactura Aditiva.
// Cada módulo tiene `slides` (modo clase) y `reading` (modo apunte completo).
// `sim` enlaza con el Simulador 2D: { tech: 'fdm'|'pbf'|'vat'|'ded', mode?: 'direct'|'bowden'|'sls'|'slm'|'sla'|'clip', label }.
// Tipos de callout: 'key' (concepto clave), 'warn' (riesgo/atención), 'info' (dato técnico).

export const MODULES = [
  {
    id: 'intro',
    n: 1,
    title: 'Introducción a la Manufactura Aditiva',
    short: 'AM/ALM, ventajas y comparación con la fabricación convencional',
    sim: null,
    slides: [
      {
        title: '¿Qué es la Manufactura Aditiva?',
        bullets: [
          'Proceso de unión de materiales para fabricar objetos a partir de un modelo 3D, habitualmente capa sobre capa (ISO/ASTM 52900).',
          'Se denomina también AM (Additive Manufacturing) o ALM (Additive Layer Manufacturing); "impresión 3D" es el término coloquial.',
          'Opuesta a los procesos sustractivos (mecanizado) y conformativos (fundición, forja, inyección).',
        ],
        callout: { type: 'key', text: 'Se agrega material solo donde la pieza lo necesita: el modelo CAD se rebana (slicing) en capas y la máquina las construye una a una.' },
        flow: ['Modelo CAD 3D', 'Archivo STL / 3MF', 'Slicing en capas', 'Construcción', 'Postproceso'],
      },
      {
        title: 'Ventajas principales',
        bullets: [
          'Libertad geométrica: geometrías complejas, cavidades internas y estructuras reticulares imposibles de mecanizar.',
          'Canales de refrigeración conformados que siguen la superficie de la pieza (matrices, moldes, intercambiadores).',
          'Ahorro de peso mediante optimización topológica y aligeramiento reticular.',
          'Consolidación de ensambles: varias piezas en una sola, menos uniones y puntos de falla.',
          'Sin utillaje: personalización masiva y series cortas económicamente viables.',
        ],
        callout: { type: 'info', text: 'La complejidad es "gratis": el costo depende del volumen, la altura y el tiempo de máquina, no de la dificultad geométrica.' },
      },
      {
        title: 'AM vs fabricación convencional',
        bullets: [
          'Convencional: alta velocidad y bajo costo por pieza en series grandes, pero exige utillaje (moldes, matrices) y limita la geometría.',
          'AM: costo por pieza casi constante, sin utillaje; velocidad baja y volúmenes limitados.',
          'Limitaciones de AM: acabado superficial y tolerancias (efecto escalera), anisotropía, tensiones residuales y costo de materiales.',
          'La tendencia es híbrida: AM para la forma, mecanizado para tolerancias críticas.',
        ],
        callout: { type: 'warn', text: 'AM no reemplaza a la inyección o fundición en grandes series: existe un punto de equilibrio de volumen que debe calcularse.' },
        flow: ['Diseño para AM (DfAM)', 'Impresión', 'Tratamiento térmico', 'Mecanizado de zonas críticas', 'Inspección'],
      },
    ],
    reading: [
      {
        h: 'Definición',
        p: [
          'La norma ISO/ASTM 52900 define la manufactura aditiva como el proceso de unir materiales para fabricar piezas a partir de datos de un modelo 3D, normalmente capa sobre capa, en oposición a las metodologías sustractivas y de conformado. En la literatura se la denomina también AM (Additive Manufacturing), ALM (Additive Layer Manufacturing), fabricación por capas o, de manera coloquial, impresión 3D.',
          'El flujo básico parte de un modelo CAD tridimensional que se exporta a un formato de malla (STL o 3MF), se orienta en el volumen de construcción, se generan los soportes necesarios y se "rebana" en capas cuyo espesor depende de la tecnología (de 0,02 mm en fotopolimerización hasta 0,5 mm o más en deposición directa).',
        ],
      },
      {
        h: 'Ventajas',
        p: ['Las ventajas de la manufactura aditiva se derivan de que el material se incorpora de forma selectiva y no hay utillaje específico por pieza:'],
        list: [
          'Geometrías complejas: cavidades, socavados, estructuras reticulares y formas orgánicas sin costo adicional de proceso.',
          'Canales de refrigeración conformados: circuitos internos que siguen la geometría de moldes, matrices o cámaras de combustión, mejorando la extracción de calor y reduciendo tiempos de ciclo.',
          'Ahorro de peso: la optimización topológica y las estructuras tipo malla reducen masa conservando la rigidez, especialmente valioso en aeronáutica y competición.',
          'Consolidación de piezas: conjuntos de decenas de componentes pueden rediseñarse como una sola pieza, eliminando uniones, sellos y operaciones de ensamble.',
          'Personalización y series cortas: sin matricería, cada pieza de un lote puede ser distinta (implantes, calzado, prótesis).',
          'Reducción de plazos y de desperdicio de material (relación "buy-to-fly" más favorable que en mecanizado desde barra).',
        ],
      },
      {
        h: 'AM frente a fabricación convencional',
        p: [
          'Los procesos convencionales (inyección, fundición, forja, mecanizado) presentan costos fijos elevados (moldes, programación, útiles) que se diluyen en series grandes, donde alcanzan un costo unitario muy bajo. La manufactura aditiva invierte esa lógica: el costo fijo es mínimo y el costo unitario es relativamente constante, por lo que resulta competitiva en series cortas y piezas complejas.',
          'Entre sus limitaciones se cuentan la baja productividad, el tamaño acotado de la cámara de construcción, el acabado superficial (efecto escalera) y las tolerancias dimensionales (típicamente ±0,1 a ±0,3 mm), la anisotropía mecánica en la dirección de construcción y las tensiones residuales en procesos con fusión localizada. Por ello las piezas funcionales suelen completarse con mecanizado de asientos y roscas, tratamientos térmicos y acabado superficial.',
        ],
      },
    ],
  },
  {
    id: 'iso',
    n: 2,
    title: 'Clasificación ISO/ASTM 52900 y Seguridad (EHS)',
    short: 'Siete categorías de proceso y riesgos laborales',
    sim: null,
    slides: [
      {
        title: 'Las 7 categorías de proceso',
        bullets: [
          'Fotopolimerización en cuba (Vat Photopolymerization): SLA, DLP, CLIP.',
          'Fusión de lecho de polvo (Powder Bed Fusion): SLS, SLM/DMLS, EBM, MJF.',
          'Inyección de aglutinante (Binder Jetting).',
          'Inyección de material (Material Jetting): PolyJet, DOD, NPJ.',
          'Laminación de hojas (Sheet Lamination): LOM, UAM.',
          'Extrusión de material (Material Extrusion): FDM/FFF.',
          'Deposición directa de energía (DED): LENS, LMD, EBAM.',
        ],
        callout: { type: 'key', text: 'La norma clasifica por el principio físico de unión de las capas, no por la marca comercial de la máquina.' },
      },
      {
        title: 'Seguridad laboral y EHS: riesgos',
        bullets: [
          'Inhalación: polvos finos (polímeros y metales) y compuestos orgánicos volátiles (COV) de resinas y filamentos calentados.',
          'Riesgos dérmicos: las resinas fotocurables son sensibilizantes y las manipulaciones de polvo y solventes (IPA) producen dermatitis.',
          'Explosión de polvos metálicos: Al, Ti y Mg finos forman nubes explosivas; las chispas electrostáticas son fuente de ignición.',
          'Radiación láser (clase 4), UV y superficies a alta temperatura.',
        ],
        callout: { type: 'warn', text: 'Los polvos de Ti, Al y Mg son pirofóricos: nunca usar agua ni extintores comunes; se requiere extintor clase D.' },
      },
      {
        title: 'Medidas de control',
        bullets: [
          'Ingeniería: ventilación y filtración HEPA, cámaras inertes (Ar/N₂), aspiración con equipamiento ATEX, puesta a tierra.',
          'Administrativas: procedimientos de carga/descarga de polvo, hojas de seguridad (SDS), capacitación.',
          'EPP: guantes de nitrilo, protección respiratoria (P3/FFP3), antiparras, ropa antiestática; gafas específicas para el láser.',
          'Gestión de residuos: resina sin curar, solventes y polvos como residuos peligrosos.',
        ],
        flow: ['Eliminar / sustituir', 'Controles de ingeniería', 'Controles administrativos', 'EPP'],
        callout: { type: 'info', text: 'La jerarquía de controles prioriza eliminar el riesgo en la fuente antes que depender del equipo de protección personal.' },
      },
    ],
    reading: [
      {
        h: 'Clasificación según ISO/ASTM 52900',
        p: [
          'La norma ISO/ASTM 52900 establece siete categorías de procesos de manufactura aditiva según el mecanismo mediante el cual se agregan y unen las capas: fotopolimerización en cuba, fusión de lecho de polvo, inyección de aglutinante, inyección de material, laminación de hojas, extrusión de material y deposición directa de energía. Dentro de cada categoría conviven tecnologías comerciales con distintas fuentes de energía y materiales.',
          'Esta clasificación es útil para seleccionar procesos: la categoría determina los materiales admisibles (polímeros, metales, cerámicos), la necesidad de soportes, el nivel de tensiones residuales, la resolución y el acabado típico.',
        ],
      },
      {
        h: 'Seguridad laboral y salud ambiental (EHS)',
        p: ['La manufactura aditiva introduce peligros específicos que deben gestionarse con una jerarquía de controles (eliminación, sustitución, controles de ingeniería, controles administrativos y EPP):'],
        list: [
          'Inhalación de polvos: las partículas finas de polímeros y metales, y los COV emitidos por resinas y por filamentos calentados (por ejemplo ABS), pueden afectar el sistema respiratorio. Se requieren cabinas ventiladas, filtración HEPA y protección respiratoria.',
          'Riesgos dérmicos: los monómeros de las resinas fotocurables son sensibilizantes y pueden causar dermatitis por contacto; el lavado con alcohol isopropílico (IPA) reseca la piel. Se deben usar guantes de nitrilo y evitar el contacto con resina sin curar.',
          'Explosión de polvos metálicos: los polvos de aluminio, titanio y magnesio, dispersos en el aire, forman atmósferas explosivas con baja energía mínima de ignición; una descarga electrostática puede iniciarlas. Se trabaja con inertización, puesta a tierra, aspiradores ATEX y extintores clase D.',
          'Radiaciones y temperatura: los láseres clase 4 requieren cabinas con ópticas de seguridad; las lámparas UV de postcurado y las superficies calientes (hotend, cama, hornos) exigen señalización y protección.',
        ],
      },
    ],
  },
  {
    id: 'vat',
    n: 3,
    title: 'Fotopolimerización en Cuba',
    short: 'SLA, DLP, DPP y CLIP; postprocesado',
    sim: { tech: 'vat', mode: 'clip', label: 'Ver CLIP en el simulador' },
    slides: [
      {
        title: 'Mecanismo de curado UV',
        bullets: [
          'Una resina líquida (monómeros/oligómeros + fotoiniciador) polimeriza al absorber luz UV (355–405 nm).',
          'El fotoiniciador genera radicales libres (acrílicos) o cationes (epoxis) que reticulan la cadena: el líquido se convierte en un sólido termoestable.',
          'Profundidad de curado según Jacobs: Cd = Dp · ln(E/Ec); controla el espesor de capa y la adhesión entre capas.',
          'Los fotopolímeros son termoestables: no se refunden ni se reciclan.',
        ],
        callout: { type: 'key', text: 'Resolución y acabado superficial son los mejores de todas las familias (Ra ≈ 1 µm), a costa de fragilidad y sensibilidad a UV y humedad.' },
        flow: ['Resina + fotoiniciador', 'Exposición UV', 'Radicales libres', 'Reticulación', 'Capa sólida'],
      },
      {
        title: 'SLA vs DLP vs DPP',
        bullets: [
          'SLA: un láser UV puntual escanea la sección con galvanómetros; flexible en tamaño pero secuencial.',
          'DLP: un proyector digital cura la capa completa de una vez: más rápido, resolución limitada por el pixel.',
          'DPP / μSLA: fotopolimerización por proyección de alta resolución para micropiezas (decenas de µm).',
          'Configuraciones: cuba con plataforma invertida (bottom-up) o plataforma descendente (top-down).',
        ],
        callout: { type: 'info', text: 'En bottom-up cada capa debe despegarse (peel) del film de la cuba: el pico de fuerza limita velocidad y geometría.' },
        sim: { tech: 'vat', mode: 'sla', label: 'Ver SLA en el simulador' },
      },
      {
        title: 'CLIP: curado continuo',
        bullets: [
          'CLIP (Continuous Liquid Interface Production) usa una ventana permeable al oxígeno (Teflon AF).',
          'El O₂ inhibe la polimerización y forma una película líquida de ~25–50 µm sobre la ventana: la zona muerta.',
          'Al no adherirse a la ventana, la plataforma sube de manera continua: sin despegue, sin capas visibles.',
          'Velocidades 25–100 veces superiores a SLA según el fabricante; resinas de curado dual (UV + térmico).',
        ],
        callout: { type: 'key', text: 'La zona muerta rellena de resina fresca por flujo lateral y convierte un proceso intermitente en uno continuo.' },
        sim: { tech: 'vat', mode: 'clip', label: 'Ver CLIP en el simulador' },
      },
      {
        title: 'Posprocesado',
        bullets: [
          'Drenaje y lavado en solvente (IPA, TPM) para eliminar resina sin curar.',
          'Retiro de soportes (puntales finos del mismo fotopolímero).',
          'Poscurado UV y/o térmico para completar la conversión y estabilizar propiedades.',
          'Lijado, pulido, pintura o recubrimiento; control de contracción (1–3 %).',
        ],
        flow: ['Drenaje', 'Lavado IPA', 'Retiro de soportes', 'Poscurado UV/térmico', 'Acabado'],
        callout: { type: 'warn', text: 'Residuos de resina y solventes son residuos peligrosos; el poscurado debe hacerse con la pieza ya limpia.' },
      },
    ],
    reading: [
      {
        h: 'Principio y mecanismo de curado',
        p: [
          'En la fotopolimerización en cuba una resina líquida fotosensible se solidifica selectivamente por exposición a luz ultravioleta o visible de longitud de onda definida. La formulación contiene monómeros y oligómeros (acrilatos, metacrilatos, epoxis), un fotoiniciador que absorbe la radiación y genera especies reactivas (radicales libres o cationes) y aditivos (absorbedores, inhibidores, cargas).',
          'La reacción de reticulación crea una red tridimensional termoestable. La profundidad de curado depende de la energía de exposición según la ley de Beer-Lambert (ecuación de Jacobs): la capa debe curarse lo suficiente para adherirse a la anterior (sobrecurado) pero sin traspasar. El proceso se acompaña de contracción volumétrica de 1 a 3 %, que origina distorsiones y tensiones.',
        ],
      },
      {
        h: 'SLA, DLP y DPP',
        p: [
          'En estereolitografía (SLA) un haz láser UV es dirigido por espejos galvanométricos para dibujar la sección sobre la superficie (o la ventana) de la cuba. En DLP (Digital Light Processing) un chip de microespejos proyecta la imagen completa de la capa, con lo que el tiempo de exposición es independiente del área; la resolución queda definida por el tamaño del píxel proyectado. DPP agrupa técnicas de proyección de alta resolución para micropiezas.',
          'Las máquinas pueden ser de plataforma invertida (la pieza cuelga y cada capa se cura contra una ventana inferior) o de superficie libre. En las primeras es necesario despegar cada capa del film de FEP o silicona, lo que genera un pico de fuerza que exige soportes y limita la velocidad.',
        ],
      },
      {
        h: 'Tecnología CLIP',
        p: [
          'CLIP (Continuous Liquid Interface Production) reemplaza la ventana convencional por una membrana permeable al oxígeno. El oxígeno que difunde a través de la membrana inhibe localmente la polimerización generando una "zona muerta" de decenas de micrómetros en la que la resina permanece líquida. La luz proyectada cura la resina inmediatamente por encima de esta película, de modo que la pieza nunca se adhiere a la ventana.',
          'Al desaparecer el ciclo de despegue y recarga, la plataforma asciende a velocidad continua mientras se proyecta una secuencia de imágenes, logrando tiempos de fabricación que son órdenes de magnitud menores y piezas con superficies sin escalonado visible. Las resinas de curado dual (UV y posterior curado térmico) mejoran propiedades mecánicas y reducen la anisotropía.',
        ],
      },
      {
        h: 'Posprocesado',
        p: [
          'Tras la construcción las piezas se escurren y se lavan con alcohol isopropílico u otros solventes para retirar la resina no polimerizada, incluso de canales internos (que deben tener vías de drenaje). Se retiran los soportes antes del poscurado, cuando el material es aún blando, y se completa la conversión en una cámara UV con control térmico. Finalmente se pueden lijar, pulir, pintar o recubrir. Las piezas deben protegerse de la luz solar y la humedad por su degradación a largo plazo.',
        ],
      },
    ],
  },
  {
    id: 'pbf',
    n: 4,
    title: 'Fusión de Lecho de Polvo (PBF)',
    short: 'SLS, SLM/DMLS, EBM y MJF',
    sim: { tech: 'pbf', mode: 'slm', label: 'Ver SLM en el simulador' },
    slides: [
      {
        title: 'Principio físico',
        bullets: [
          'Una fuente de energía (láser o haz de electrones) funde o sinteriza selectivamente la sección sobre una capa de polvo.',
          'Ciclo: dosificar → recubrir con rodillo/rasqueta → escanear → descender plataforma.',
          'El polvo no fusionado sostiene la pieza: soporte natural en polímeros; en metales se agregan soportes soldados.',
          'Capas de 20–100 µm; densidades hasta > 99,5 % en metales.',
        ],
        flow: ['Dosificación', 'Recubrimiento', 'Escaneo', 'Descenso'],
        callout: { type: 'key', text: 'El polvo suelto actúa como soporte, pero también es un riesgo (EHS) y debe evacuarse de canales internos.' },
        sim: { tech: 'pbf', mode: 'sls', label: 'Ver el ciclo en el simulador' },
      },
      {
        title: 'SLS: polímeros autosoportados',
        bullets: [
          'Láser CO₂ sinteriza polvo de PA12 / PA11 precalentado cerca de su temperatura de fusión.',
          'Sinterizado: fusión parcial de las partículas; la pieza queda porosa (~ 2–5 %).',
          'Sin soportes: se anidan decenas de piezas en 3D en el mismo build.',
          'Reciclado de polvo con mezcla de polvo fresco (refresh) para mantener propiedades.',
        ],
        callout: { type: 'info', text: 'Isotropía alta (Z ≈ 90–95 % de XY) y buena tenacidad: apto para piezas funcionales y snap-fits.' },
        sim: { tech: 'pbf', mode: 'sls', label: 'Ver SLS en el simulador' },
      },
      {
        title: 'SLM / DMLS: fusión total en metales',
        bullets: [
          'SLM (Selective Laser Melting) funde completamente el polvo metálico: baño líquido y solidificación rápida (10⁵–10⁶ K/s).',
          'DMLS (Direct Metal Laser Sintering) es el nombre comercial de EOS; en la práctica también funde totalmente en aleaciones.',
          'Gradientes térmicos extremos → tensiones residuales, alabeo y delaminación.',
          'Soportes soldados del mismo material anclan la pieza a la placa base y evacúan calor.',
        ],
        callout: { type: 'warn', text: 'Alivio de tensiones en horno con la pieza aún soldada a la placa, y luego corte por EDM; sin ese orden la pieza se deforma.' },
        flow: ['Enfriamiento', 'Retiro de polvo', 'Alivio de tensiones', 'EDM de soportes', 'Mecanizado / HIP'],
        sim: { tech: 'pbf', mode: 'slm', label: 'Ver SLM en el simulador' },
      },
      {
        title: 'EBM y MJF',
        bullets: [
          'EBM (Electron Beam Melting): haz de electrones en vacío; la cama se precalienta a ~ 700 °C → tensiones muy bajas; ideal para Ti-6Al-4V e implantes.',
          'EBM: acabado más rugoso (polvo más grueso) y resolución menor que SLM.',
          'MJF (Multi Jet Fusion, HP): se deposita un agente fusionante y un agente de detalle sobre el polvo de PA12; una lámpara IR aporta la energía y fusiona la capa completa.',
          'MJF: alta productividad, buenas propiedades y piezas grises/negras por el agente absorbente.',
        ],
        callout: { type: 'key', text: 'Los agentes térmicos del MJF absorben IR donde se necesita fundir y disipan donde no: control del borde sin láser puntual.' },
      },
    ],
    reading: [
      {
        h: 'Principio físico',
        p: [
          'La fusión de lecho de polvo (Powder Bed Fusion) utiliza una fuente de energía térmica —láser o haz de electrones— para fundir o sinterizar selectivamente regiones de un lecho de polvo. Entre capas, un mecanismo de recubrimiento (rodillo o rasqueta) extiende una nueva capa uniforme de polvo proveniente de un pistón dosificador mientras la plataforma de construcción desciende un espesor de capa. El sobrante se desplaza a una cámara de desborde.',
          'La energía depositada depende de la potencia, la velocidad de escaneo, el espaciado de hatch y el espesor de capa (densidad de energía volumétrica). Una densidad insuficiente deja porosidad por falta de fusión; una excesiva genera porosidad por gases (keyhole) y salpicaduras.',
        ],
      },
      {
        h: 'SLS: sinterizado de polímeros',
        p: [
          'En el sinterizado selectivo por láser (SLS) un láser de CO₂ calienta polvo polimérico —principalmente poliamidas PA12 y PA11— por encima de su temperatura de sinterizado, uniendo las partículas por difusión y fusión parcial. El polvo del lecho se mantiene a una temperatura apenas inferior a la de fusión, de modo que el aporte del láser es mínimo y los gradientes térmicos son bajos.',
          'Como el polvo circundante sostiene los voladizos, no se requieren soportes y las piezas pueden anidarse en todo el volumen. Tras el proceso, el bloque ("cake") se enfría lentamente, se desempolva y se granalla. El polvo no sinterizado se recicla mezclándolo con polvo fresco para evitar el envejecimiento del polímero.',
        ],
      },
      {
        h: 'SLM y DMLS: fusión de metales',
        p: [
          'En SLM (Selective Laser Melting) y DMLS (Direct Metal Laser Sintering) un láser de fibra de 200 a 1000 W funde completamente el polvo metálico en una atmósfera inerte de argón o nitrógeno. La diferencia entre "fusión total" y "sinterizado" es que en la primera el material pasa íntegramente al estado líquido y se obtienen densidades superiores al 99,5 %, mientras que en el sinterizado las partículas se unen en estado parcialmente fundido y la pieza conserva porosidad. En la práctica DMLS es una denominación comercial de EOS y la mayoría de los equipos actuales operan por fusión completa.',
          'La solidificación rápida y los ciclos térmicos locales generan tensiones residuales que pueden provocar alabeo, fisuración o desprendimiento de la placa. Para evitarlo se diseñan soportes soldados del mismo material, que anclan la pieza a la placa base y conducen el calor. La secuencia posterior típica es: enfriamiento controlado, retiro y reciclaje de polvo, alivio de tensiones en horno con la pieza sobre la placa, separación por electroerosión (EDM) o sierra, retiro de soportes, eventual prensado isostático en caliente (HIP), mecanizado de asientos y roscas y acabado superficial.',
        ],
      },
      {
        h: 'EBM: fusión por haz de electrones',
        p: [
          'La fusión por haz de electrones (EBM) opera en alto vacío (~10⁻⁴ a 10⁻⁵ mbar), lo que protege materiales reactivos como el titanio. El haz de electrones, desviado por bobinas magnéticas, escanea a velocidades muy altas y el lecho se precalienta a unos 700 °C (hasta más de 1000 °C en TiAl), por lo que las tensiones residuales son mínimas y se requieren pocos soportes. A cambio, el espesor de capa y el tamaño de polvo son mayores y el acabado superficial es más rugoso que en SLM. Es el proceso habitual para implantes ortopédicos de Ti-6Al-4V y componentes aeroespaciales.',
        ],
      },
      {
        h: 'MJF: Multi Jet Fusion',
        p: [
          'En Multi Jet Fusion (HP) se extiende una capa de polvo de PA12 y un carro de inyección deposita sobre ella un agente fusionante (que absorbe radiación infrarroja) en la sección a fundir y un agente de detalle (que enfría) en los bordes. A continuación, una lámpara infrarroja barre toda la capa: las zonas con agente fusionante absorben energía y funden, mientras el resto permanece sin fundir. Al fusionar la capa completa en una sola pasada, la productividad es alta y la isotropía mecánica, buena. El agente absorbente confiere color gris oscuro a las piezas.',
        ],
      },
    ],
  },
  {
    id: 'bj',
    n: 5,
    title: 'Inyección de Aglutinante (Binder Jetting)',
    short: 'Proceso en frío, pieza en verde, infiltración y sinterizado',
    sim: null,
    slides: [
      {
        title: 'Principio: proceso en frío',
        bullets: [
          'Un cabezal de inyección deposita gotas de aglutinante (binder) líquido sobre un lecho de polvo.',
          'No hay fusión durante la construcción: no existen tensiones residuales ni alabeo.',
          'El polvo circundante sostiene la pieza: sin soportes y con anidado 3D total.',
          'Materiales: metales, arena de fundición, cerámicos y yeso a color.',
        ],
        callout: { type: 'key', text: 'Al no haber aporte térmico en la construcción, no hay tensiones residuales: la pieza "en verde" se densifica después.' },
      },
      {
        title: 'Pieza en verde y densificación',
        bullets: [
          'La pieza en verde es frágil: se cura el binder y se desempolva con cuidado.',
          'Metales: debinding térmico + sinterizado (contracción lineal ≈ 15–20 %, compensada en el CAD).',
          'Infiltración con bronce o resina para sellar porosidad en rutas alternativas.',
          'Arena: se utiliza directamente como molde/noyo de fundición (binder furánico).',
        ],
        flow: ['Impresión', 'Curado del binder', 'Desempolvado', 'Debinding', 'Sinterizado / infiltración'],
        callout: { type: 'warn', text: 'La contracción de sinterizado no es uniforme: las piezas esbeltas pueden distorsionarse o hundirse (sagging) sin soportes cerámicos.' },
      },
    ],
    reading: [
      {
        h: 'Principio de la inyección de aglutinante',
        p: [
          'En el Binder Jetting un cabezal de inyección similar al de una impresora de tinta deposita selectivamente gotas de un agente aglutinante sobre un lecho de polvo. Al curar, el aglutinante une las partículas entre sí y con la capa inferior. Entre capas, el lecho desciende y se extiende una nueva capa de polvo. Como el proceso se realiza a temperatura ambiente, no se introducen gradientes térmicos: no hay tensiones residuales, alabeo ni necesidad de soportes de anclaje, y el polvo suelto sirve de soporte.',
        ],
      },
      {
        h: 'Pieza en verde, infiltración y sinterizado',
        p: [
          'La pieza obtenida (pieza "en verde") tiene baja resistencia y debe manipularse con cuidado. En metales, se cura el aglutinante en horno, se retira el polvo, se elimina el binder por tratamiento térmico (debinding) y se sinteriza a una temperatura próxima a la de fusión, con lo que se alcanza una densidad de 95 a 99 %. Durante el sinterizado se produce una contracción volumétrica de hasta 35 % (15–20 % lineal) que se compensa escalando el modelo.',
          'Alternativamente, la pieza puede infiltrarse con un metal de menor punto de fusión (por ejemplo bronce en acero) o con resinas para sellar la porosidad. En arenas de fundición y cerámicos, la pieza impresa se usa directamente como molde o se sinteriza. Además existen variantes a color con yeso o polímero.',
        ],
      },
    ],
  },
  {
    id: 'mj',
    n: 6,
    title: 'Inyección de Material (Material Jetting)',
    short: 'PolyJet, DOD, NPJ y multimaterial',
    sim: null,
    slides: [
      {
        title: 'PolyJet: fotopolímero inyectado',
        bullets: [
          'Cabezales depositan gotas de fotopolímero (picolitros) que se curan al instante con lámpara UV.',
          'Capas de 16–30 µm; resolución y acabado superficial excelentes.',
          'Multimaterial y color: mezclas de rígidos y elastoméricos (27–95 Shore A) en una sola pieza.',
          'Soportes de gel soluble/removibles con chorro de agua.',
        ],
        callout: { type: 'info', text: 'Ideal para prototipos estéticos y ergonómicos con múltiples durezas y colores en un solo build.' },
      },
      {
        title: 'DOD y NPJ',
        bullets: [
          'DOD (Drop-on-Demand): dos cabezales, uno de material de construcción (cera) y otro de soporte soluble; la cera es útil como patrón de microfusión (cera perdida).',
          'NPJ (NanoParticle Jetting, XJet): tinta con nanopartículas metálicas o cerámicas en un líquido portador.',
          'En NPJ el líquido se evapora a ~ 300 °C en la cámara y luego se sinteriza la pieza: alta resolución y soportes solubles.',
          'Multimaterial y gradientes funcionales de dureza, color y transparencia.',
        ],
        flow: ['Inyección de gotas', 'Curado UV / evaporación', 'Capa sólida', 'Retiro de soporte', 'Sinterizado (NPJ)'],
        callout: { type: 'warn', text: 'Los fotopolímeros de PolyJet son frágiles y se degradan con UV y humedad: no son para ensayo funcional.' },
      },
    ],
    reading: [
      {
        h: 'Principio de la inyección de material',
        p: [
          'La inyección de material (Material Jetting) deposita gotas de material de construcción mediante cabezales de inyección piezoeléctricos y solidifica cada gota inmediatamente (por curado UV, enfriamiento o evaporación del portador). A diferencia del Binder Jetting, el material de construcción se inyecta directamente, por lo que se pueden combinar varios materiales dentro de una misma capa.',
        ],
      },
      {
        h: 'PolyJet',
        p: [
          'En PolyJet (Stratasys) los cabezales inyectan fotopolímeros que se curan con lámparas UV inmediatamente después del depósito. Se obtienen capas de 16 a 30 µm y piezas de excelente acabado. Se pueden imprimir simultáneamente materiales de distinta dureza (de 27 a 95 Shore A), colores y transparencia, e incluso materiales digitales por mezcla de gotas. Los soportes se imprimen en un material gelatinoso o soluble que se retira con chorro de agua.',
        ],
      },
      {
        h: 'DOD y NPJ',
        p: [
          'En el modo Drop-on-Demand (DOD) la máquina dispone de un cabezal de material de construcción —habitualmente una cera— y otro de material de soporte soluble, y un fresado fly-cutter nivela la capa. Las piezas de cera se utilizan como patrones perdidos en fundición a la cera perdida (microfusión), con excelente acabado.',
          'En NanoParticle Jetting (NPJ), de XJet, la tinta contiene nanopartículas de metal o cerámica suspendidas en un líquido portador. La cámara de construcción se mantiene a unos 300 °C, temperatura a la que el portador se evapora dejando las nanopartículas; la pieza se sinteriza luego en horno. Como el soporte también se inyecta como un material soluble, se obtienen geometrías complejas con alta definición y se posibilitan estructuras multimaterial.',
        ],
      },
    ],
  },
  {
    id: 'sheet',
    n: 7,
    title: 'Laminación de Hojas (Sheet Lamination)',
    short: 'LOM y UAM',
    sim: null,
    slides: [
      {
        title: 'LOM: papel y adhesivo',
        bullets: [
          'Laminated Object Manufacturing: hojas de papel (o plástico) con adhesivo termoactivado se adhieren con un rodillo caliente.',
          'Un láser o cuchilla corta el contorno de cada capa y la zona sobrante se cuadricula para su retiro.',
          'Bajo costo y grandes volúmenes; piezas tipo madera, ideales para modelos visuales.',
          'Limitaciones: baja precisión en Z, propiedades dependientes del adhesivo y desperdicio.',
        ],
        flow: ['Alimentar hoja', 'Adherir con rodillo', 'Cortar contorno', 'Cuadricular sobrante', 'Repetir'],
        callout: { type: 'info', text: 'Una variante con hojas metálicas y soldadura/brazing o láser permite piezas laminadas de metal.' },
      },
      {
        title: 'UAM: soldadura ultrasónica',
        bullets: [
          'Ultrasonic Additive Manufacturing: cintas metálicas (Al, Cu, Ti, acero) se unen por soldadura ultrasónica en estado sólido, sin fusión.',
          'Un sonotrodo vibrando a 20 kHz produce deformación plástica y rompe óxidos superficiales: unión metalúrgica a baja temperatura.',
          'Híbrido: entre depósitos se fresa por CNC para dar la forma, permitiendo canales internos y detalles.',
          'Permite embeber componentes electrónicos y sensores, fibras ópticas y uniones de metales disímiles.',
        ],
        callout: { type: 'key', text: 'Sin fusión no hay tensiones residuales ni zona afectada: es posible unir Al con Cu o con acero sin intermetálicos.' },
        flow: ['Cinta metálica', 'Soldadura ultrasónica', 'Fresado CNC', 'Embeber sensores', 'Capa siguiente'],
      },
    ],
    reading: [
      {
        h: 'Laminación de hojas: concepto',
        p: [
          'En la laminación de hojas (Sheet Lamination) la pieza se construye apilando y uniendo láminas de material recortadas con el contorno de cada sección. Las dos variantes principales son LOM (adhesivo) y UAM (soldadura ultrasónica).',
        ],
      },
      {
        h: 'LOM: Laminated Object Manufacturing',
        p: [
          'En LOM una hoja de papel o de polímero recubierta con adhesivo termoactivado se alimenta desde un rollo, se adhiere a la capa inferior con un rodillo caliente y se recorta con un láser o cuchilla siguiendo el contorno de la sección. El material sobrante se subdivide en cuadrículas que se retiran al final. Es un proceso de bajo costo para modelos visuales y moldes de gran tamaño, con limitaciones en precisión, resistencia (dependiente del adhesivo) y desperdicio de material.',
        ],
      },
      {
        h: 'UAM: Ultrasonic Additive Manufacturing',
        p: [
          'La manufactura aditiva ultrasónica (Fabrisonic) une cintas metálicas mediante soldadura ultrasónica en estado sólido. Un sonotrodo presiona la cinta contra el sustrato mientras vibra a 20 kHz; la fricción rompe las películas de óxido y produce una unión metalúrgica sin llegar a fundir, a temperaturas inferiores al 50 % de la de fusión. Por ser un proceso en frío, se pueden unir materiales disímiles (Al–Cu, Ti–Al) y se evitan las tensiones y distorsiones propias de la fusión.',
          'La máquina combina deposición con fresado CNC sustractivo: después de varias capas, se mecaniza el contorno, lo que permite construir canales internos y detalles de gran precisión. Además, como no hay temperatura elevada, es posible embeber componentes delicados —sensores, fibras ópticas, circuitos electrónicos— dentro de la pieza metálica.',
        ],
      },
    ],
  },
  {
    id: 'mex',
    n: 8,
    title: 'Extrusión de Material (FDM/FFF)',
    short: 'Hotend, Bowden vs Direct Drive, materiales, CFF y anisotropía',
    sim: { tech: 'fdm', mode: 'bowden', label: 'Ver Bowden vs Direct Drive' },
    slides: [
      {
        title: 'Mecánica térmica del proceso',
        bullets: [
          'El filamento es empujado por un extrusor hacia el hotend, donde un bloque calefactor lo funde (190–450 °C) y una boquilla de 0,2–1 mm lo deposita.',
          'La cama calefaccionada (60–150 °C) mejora la adhesión y reduce el alabeo; el ventilador de capa enfría el cordón.',
          'La adhesión entre cordones ocurre por difusión de las cadenas poliméricas cuando la temperatura supera la de transición vítrea.',
          'Parámetros clave: temperatura, velocidad, altura de capa, relleno y flujo.',
        ],
        flow: ['Filamento', 'Extrusor', 'Hotend (fusión)', 'Boquilla', 'Cordón sobre cama'],
        callout: { type: 'key', text: 'Es el proceso más difundido y económico; la calidad depende de controlar la ventana térmica de cada polímero.' },
        sim: { tech: 'fdm', mode: 'direct', label: 'Ver Direct Drive en el simulador' },
      },
      {
        title: 'Bowden vs Direct Drive',
        bullets: [
          'Direct Drive: el motor del extrusor está sobre el carro: camino de filamento corto, retracción de 0,5–1,5 mm y buen control de flexibles (TPU); mayor masa en movimiento.',
          'Bowden: el motor está fijo al bastidor y un tubo PTFE guía el filamento: cabezal liviano y alta aceleración, pero el filamento actúa como resorte y requiere retracciones de 4–7 mm.',
          'Bowden tiene problemas con flexibles: se pandea dentro del tubo.',
        ],
        callout: { type: 'info', text: 'Menor inercia (Bowden) permite mayores velocidades y aceleraciones; menor elasticidad del camino (Direct Drive) da mejor control del flujo.' },
        sim: { tech: 'fdm', mode: 'bowden', label: 'Ver Bowden vs Direct Drive' },
      },
      {
        title: 'Materiales y refuerzo con fibra continua',
        bullets: [
          'Comunes: PLA (fácil, frágil), ABS (tenaz, requiere cama caliente y cámara), PETG, TPU (flexible).',
          'Técnicos: PA (nylon) y sus compuestos con fibra corta, PC, ULTEM (PEI) y PEEK (semicristalino, > 400 °C en boquilla, cámara caliente).',
          'CFF (Continuous Filament Fabrication, Markforged): fibra continua de carbono, vidrio o Kevlar embebida en una matriz de nylon; relación resistencia/peso cercana a aluminio.',
          'Soportes solubles (PVA, BVOH, HIPS) en máquinas de doble extrusión.',
        ],
        callout: { type: 'key', text: 'La fibra continua se coloca en el plano XY siguiendo las trayectorias de carga: el refuerzo no resuelve la debilidad en Z.' },
      },
      {
        title: 'Anisotropía mecánica en Z',
        bullets: [
          'La unión entre capas es más débil que el cordón: la resistencia en Z es solo ~ 40–60 % de la de XY.',
          'Los huecos entre cordones y la difusión parcial reducen la sección portante interlaminar.',
          'Diseño: orientar la pieza de modo que las cargas de tracción no actúen perpendiculares a las capas.',
          'Mejora: mayor temperatura, menor altura de capa, cámara caliente y recocido.',
        ],
        callout: { type: 'warn', text: 'En piezas cargadas a tracción en Z, una orientación incorrecta puede reducir la resistencia a la mitad: es un criterio central de DfAM.' },
        sim: { tech: 'fdm', mode: 'direct', label: 'Ver deposición por capas' },
      },
    ],
    reading: [
      {
        h: 'Principio y mecánica térmica',
        p: [
          'En la extrusión de material (Material Extrusion, comercialmente FDM o FFF) un filamento termoplástico es impulsado por un extrusor de engranajes hacia el hotend, donde se funde en un bloque calefactor y es expulsado por una boquilla de diámetro típico 0,4 mm. El cabezal se desplaza siguiendo la trayectoria de la capa sobre una cama que se calienta para mejorar la adhesión del primer nivel y limitar las contracciones diferenciales que provocan alabeo (warping).',
          'La unión entre cordones adyacentes y entre capas se produce por difusión de cadenas poliméricas mientras el material permanece por encima de su temperatura de transición vítrea. Por ello la ventana de proceso (temperaturas de boquilla, cama y cámara, velocidad y refrigeración) condiciona de manera decisiva la resistencia de la pieza.',
        ],
      },
      {
        h: 'Bowden frente a Direct Drive',
        p: [
          'En la configuración Direct Drive el motor del extrusor se monta sobre el carro, junto al hotend. El camino del filamento es corto (30–50 mm), lo que reduce la elasticidad del sistema, permite retracciones breves (0,5–1,5 mm) y facilita el uso de filamentos flexibles. El inconveniente es el aumento de la masa móvil (300–400 g), que impone menores aceleraciones por inercia.',
          'En la configuración Bowden el motor está fijo al bastidor y el filamento se guía mediante un tubo de PTFE hasta el hotend. El cabezal es muy liviano (100–150 g), lo que admite altas velocidades y aceleraciones, pero la longitud del recorrido (400–800 mm) hace que el filamento se comporte como un resorte: se comprime y se retrasa la respuesta del flujo, lo que obliga a retracciones largas (4–7 mm), provoca rezumado (ooze) en los cambios de dirección y dificulta el uso de materiales flexibles, que se pandean dentro del tubo.',
        ],
      },
      {
        h: 'Materiales comunes y técnicos',
        p: [
          'Los materiales de uso general son el PLA (biodegradable, fácil de imprimir y rígido pero frágil y de baja temperatura de servicio), el ABS (más tenaz y resistente al calor pero con contracción y emisión de COV, por lo que requiere cama caliente y recinto), el PETG y el TPU (elastómero). Los materiales técnicos incluyen poliamidas (PA6, PA12) con o sin refuerzo de fibra corta, policarbonato, PEI (ULTEM) y PEEK, un polímero semicristalino de alto desempeño que se procesa con hotend de hasta 450 °C y cámara a más de 120 °C para lograr cristalinidad adecuada.',
          'Los sistemas de doble extrusión permiten usar soportes solubles (PVA, BVOH o HIPS) que se disuelven en agua o limoneno, indispensables para canales internos y geometrías complejas.',
        ],
      },
      {
        h: 'Refuerzo con fibra continua (CFF)',
        p: [
          'En la tecnología CFF (Continuous Filament Fabrication) una segunda boquilla coloca una fibra continua de carbono, vidrio o aramida preimpregnada o embebida en la matriz de nylon, siguiendo las direcciones principales de tensión. Se obtienen piezas con rigidez y resistencia específicas cercanas a las de aluminio. Como la fibra se orienta en el plano de capa, el refuerzo mejora XY pero no corrige la debilidad interlaminar.',
        ],
      },
      {
        h: 'Anisotropía mecánica en Z',
        p: [
          'La resistencia de una pieza FDM depende de la dirección de carga. En el plano de capa las tensiones son resistidas por el filamento continuo, mientras que en la dirección Z las cargas de tracción actúan sobre las uniones entre capas, que tienen sección portante reducida por los huecos entre cordones y difusión incompleta. Es habitual que la resistencia a tracción en Z sea apenas del 40 al 60 % de la de XY, con rotura frágil por delaminación.',
          'Para mitigar este efecto se orientan las piezas de modo que la tracción principal quede en el plano de capa, se aumenta la temperatura de proceso, se reduce la altura de capa, se utiliza cámara caliente y se aplica recocido posterior (por ejemplo, en PEEK y PLA).',
        ],
      },
    ],
  },
  {
    id: 'ded',
    n: 9,
    title: 'Deposición Directa de Energía (DED) y Máquinas Híbridas',
    short: 'LENS, LMD, EBAM y centros combinados CNC 5 ejes',
    sim: { tech: 'ded', mode: null, label: 'Ver DED híbrido en el simulador' },
    slides: [
      {
        title: 'Principio de DED',
        bullets: [
          'Una fuente de energía focalizada (láser, haz de electrones o arco) crea un baño fundido sobre el sustrato donde se alimenta material en forma de polvo o alambre.',
          'LENS (Laser Engineered Net Shaping) y LMD (Laser Metal Deposition): láser + polvo inyectado por una boquilla coaxial.',
          'EBAM (Electron Beam Additive Manufacturing): haz de electrones en vacío + alambre; altísimas tasas de deposición (hasta decenas de kg/h).',
          'No necesita cama de polvo: se deposita sobre una pieza existente en cualquier orientación (5 ejes).',
        ],
        callout: { type: 'key', text: 'La deposición ocurre in-situ: se puede agregar material sobre una pieza ya fabricada, por ello es el proceso de reparación y recargue.' },
        sim: { tech: 'ded', mode: null, label: 'Ver DED en el simulador' },
      },
      {
        title: 'Aplicaciones y calidad superficial',
        bullets: [
          'Reparación de álabes de turbina, matrices y ejes con desgaste localizado.',
          'Recargue con aleaciones resistentes al desgaste/corrosión y materiales de gradiente funcional.',
          'Piezas grandes (metros) y alta velocidad de construcción (EBAM, WAAM).',
          'Rugosidad as-built elevada (Ra ≈ 60–100 µm) y baja resolución (≥ 0,5–1 mm): requiere mecanizado de terminación.',
        ],
        callout: { type: 'warn', text: 'Ra de 60–100 µm: la pieza debe fabricarse con sobre-espesor para permitir el mecanizado final.' },
        flow: ['Pieza base', 'Aporte DED', 'Sobre-espesor', 'Fresado CNC', 'Cota final'],
      },
      {
        title: 'Máquinas híbridas CNC 5 ejes',
        bullets: [
          'Centros combinados DMG MORI (LASERTEC DED hybrid) y AMBIT (Hybrid Manufacturing Technologies): cabezal DED intercambiable con husillo de fresado.',
          'Ciclo: aporte de varias capas → fresado de terminación → medición, en un solo amarre.',
          'Mecanizado de zonas inaccesibles antes de que queden cubiertas (canales, cavidades).',
          'Resultado: aditivo para la forma, sustractivo para tolerancia y rugosidad.',
        ],
        callout: { type: 'info', text: 'El sustractivo en el mismo amarre elimina errores de referencia y reduce el tiempo total frente a procesos separados.' },
        sim: { tech: 'ded', mode: null, label: 'Ver ciclo híbrido en el simulador' },
      },
    ],
    reading: [
      {
        h: 'Principio de la deposición directa de energía',
        p: [
          'En la deposición directa de energía (DED) una fuente de energía focalizada (láser, haz de electrones o arco de plasma/eléctrico) genera un baño fundido sobre la superficie de una pieza o sustrato, en el que se alimenta simultáneamente material en forma de polvo o de alambre. Al desplazarse el cabezal, el baño solidifica y forma un cordón metalúrgicamente unido al sustrato. La deposición se realiza sin cama de polvo y el cabezal puede ser móvil en cinco ejes, por lo que es posible construir sobre superficies existentes y producir piezas de gran tamaño.',
        ],
      },
      {
        h: 'LENS, LMD y EBAM',
        p: [
          'LENS (Laser Engineered Net Shaping, de Sandia/Optomec) y LMD (Laser Metal Deposition) inyectan polvo mediante una boquilla coaxial al haz láser, con gas de protección. Las capas son de 0,3 a 1,5 mm y las tasas de deposición moderadas (hasta 0,5–1 kg/h).',
          'EBAM (Electron Beam Additive Manufacturing, Sciaky) utiliza un haz de electrones en cámara de vacío y alambre como materia prima, alcanzando tasas de deposición de varios kilogramos por hora (hasta 10 kg/h o más) y piezas de varios metros de titanio, ideales para estructuras aeronáuticas. Los procesos con arco (WAAM) ofrecen resultados similares con equipamiento más económico.',
        ],
      },
      {
        h: 'Reparación y rugosidad',
        p: [
          'Una aplicación clave es la reparación de componentes de alto valor, como álabes de turbinas de gas con desgaste en la punta, matrices y ejes: se mecaniza la zona dañada, se deposita material compatible y se restituye la geometría. Al depositar sólo en la región afectada, el aporte térmico es acotado y se minimiza la zona afectada por el calor.',
          'La contrapartida es la mala calidad superficial: por la geometría del cordón y las partículas semifundidas, la rugosidad as-built suele estar entre 60 y 100 µm Ra y la resolución es baja, de modo que las piezas se construyen con sobre-espesor y se terminan por mecanizado.',
        ],
      },
      {
        h: 'Máquinas híbridas',
        p: [
          'Las máquinas híbridas integran en un mismo centro de mecanizado CNC de cinco ejes un cabezal de deposición DED y un husillo de fresado. Ejemplos industriales son las series LASERTEC DED hybrid de DMG MORI y los sistemas AMBIT de Hybrid Manufacturing Technologies. El ciclo típico alterna aporte y fresado: se depositan algunas capas, se mecaniza para obtener la cota nominal y se miden las superficies, todo con el mismo amarre. Esta estrategia permite acceder a zonas internas que luego quedarían cubiertas, controlar la rugosidad y garantizar tolerancias de mecanizado con la libertad de forma del proceso aditivo.',
        ],
      },
    ],
  },
]
