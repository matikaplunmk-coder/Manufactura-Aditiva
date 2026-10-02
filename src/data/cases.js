// Casos de estudio de planta. `options[correct]` es la tecnología adecuada.
export const CASES = [
  {
    id: 1,
    title: 'Recuperación de álabe de turbina de gas',
    tag: 'Reparación · Superaleación base Ni',
    scenario:
      'Álabe de turbina de gas de primera etapa (superaleación base níquel γ′) con desgaste localizado en la punta (≈ 3 mm de pérdida). Reemplazarlo cuesta decenas de miles de USD y el plazo de entrega es de meses. Se necesita restituir la geometría sobre la pieza existente.',
    needs: ['Aportar material sobre una pieza ya fabricada', 'Mínima entrada térmica (superaleación fisurable)', 'Posterior mecanizado al perfil aerodinámico'],
    options: [
      {
        name: 'DED (deposición dirigida de energía, híbrido)',
        why: 'Correcto: la boquilla coaxial deposita polvo sobre la punta del álabe en cualquier orientación (5 ejes) y el ciclo híbrido fresa al perfil nominal en el mismo amarre.',
      },
      {
        name: 'SLM / DMLS',
        why: 'El lecho de polvo exige construir desde la placa base: no se puede agregar material sobre una pieza ya fabricada sin reconstruirla completa. Costo y tiempo desproporcionados.',
      },
      {
        name: 'Binder Jetting metálico',
        why: 'La pieza en verde se sinteriza con contracción del 15–20 %: imposible unir metalúrgicamente a un álabe existente y no alcanza densidad ni resistencia a fluencia necesarias.',
      },
      {
        name: 'FDM con filamento metálico (BMD)',
        why: 'Requiere debinding y sinterizado de toda la pieza: no sirve para reparar y la densidad (~ 96 %) es insuficiente para servicio a alta temperatura.',
      },
    ],
    correct: 0,
    just: {
      Económica: 'Reparar cuesta 20–40 % de un álabe nuevo y evita el plazo de fabricación por fundición direccional. Se amortiza con una sola reparación.',
      Térmica: 'El aporte es localizado: la zona afectada por el calor es pequeña y se puede precalentar el álabe localmente para reducir gradientes y fisuración. La pieza no entra entera a un ciclo térmico.',
      Metalúrgica: 'Las superaleaciones γ′ son difíciles de soldar (fisuración por licuación y por envejecimiento). DED con baja energía lineal y polvo compatible logra unión metalúrgica con el sustrato, seguida de tratamiento térmico/HIP y mecanizado al perfil.',
    },
  },
  {
    id: 2,
    title: 'Colector de escape de competición',
    tag: 'Metal · AlSi10Mg · refrigeración conformada',
    scenario:
      'Equipo de competición necesita un colector de escape con camisas de refrigeración conformada integradas en AlSi10Mg. Serie de 1 a 10 unidades, iteraciones de diseño cada semana. La geometría no puede fabricarse por mecanizado ni por fundición con noyos.',
    needs: ['Canales internos conformados', 'Serie muy corta, sin utillaje', 'Propiedades superiores a la fundición'],
    options: [
      {
        name: 'SLM / DMLS (aluminio)',
        why: 'Correcto: fusión completa por láser de fibra, canales internos con polvo evacuable y soportes soldados que disipan calor y evitan el alabeo.',
      },
      {
        name: 'DED',
        why: 'La resolución (≥ 1 mm) y la falta de soportes internos impiden canales de refrigeración finos y conformados; el acabado exige mecanizado completo.',
      },
      {
        name: 'SLS de PA12',
        why: 'Un polímero no resiste temperaturas de gases de escape ni la conducción de calor requerida: funde o se degrada.',
      },
      {
        name: 'Binder Jetting de arena + fundición',
        why: 'Viable para molde con noyos, pero sale más lento y caro para 1–10 piezas con iteraciones semanales, y la fundición tiene menor resistencia y porosidad.',
      },
    ],
    correct: 0,
    just: {
      Económica: 'Sin matricería ni noyos: cada iteración sale en días. El costo por pieza es alto, pero la consolidación del conjunto en una sola pieza reduce soldaduras y ensamble.',
      Térmica: 'El aluminio refleja el láser y conduce calor: requiere láser de alta potencia, precalentamiento de placa (150–200 °C) y soportes soldados para extraer calor. La refrigeración conformada baja la temperatura de pared.',
      Metalúrgica: 'La solidificación ultrarrápida (10⁵–10⁶ K/s) forma una microestructura celular fina de Si eutéctico: mayor resistencia que la fundición. Alivio de tensiones a ~ 300 °C 2 h, retiro de placa por EDM y mecanizado de bridas.',
    },
  },
  {
    id: 3,
    title: 'Lote de 250 clips y carcasas flexibles',
    tag: 'Polímero · PA12 · producción sin matricería',
    scenario:
      'Se requieren 250 clips con bisagra viva y carcasas encastrables en nylon PA12, sin inversión en matricería. La pieza debe resistir ciclos de flexión y ensamblarse a presión. El cliente necesita el lote en una semana.',
    needs: ['Lote de ~ 250 unidades', 'Flexibilidad y tenacidad (snap-fit)', 'Sin soportes ni utillaje'],
    options: [
      {
        name: 'MJF / SLS (PA12)',
        why: 'Correcto: se anidan decenas de piezas en 3D en un mismo build, sin soportes, con PA12 tenaz y de buena resistencia a fatiga.',
      },
      {
        name: 'SLA con resina estándar',
        why: 'Buen acabado pero resinas frágiles: los clips rompen al encastrar y las bisagras vivas no soportan ciclos de flexión.',
      },
      {
        name: 'FDM con PLA',
        why: 'PLA es frágil y la anisotropía en Z debilita la bisagra; además requiere soportes y muchas horas por unidad.',
      },
      {
        name: 'Binder Jetting metálico',
        why: 'Material y proceso inadecuados: pieza rígida, contracción por sinterizado y costo excesivo para un clip plástico.',
      },
    ],
    correct: 0,
    just: {
      Económica: 'Un molde de inyección cuesta USD 15–40 mil: para 250 unidades el costo por pieza sería prohibitivo. El anidado 3D en MJF/SLS reparte el tiempo de máquina entre todas las piezas y no hay inversión de utillaje.',
      Térmica: 'La cámara se mantiene cerca de la temperatura de fusión del PA12 (~ 170–180 °C): bajos gradientes, sin alabeo y sin soportes. Se requiere un enfriamiento controlado del "cake" antes de extraer.',
      Metalúrgica: 'PA12 semicristalino con alargamiento a rotura de 15–20 % y buena resistencia a fatiga en bisagras; isotropía de 90–95 %. El polvo no fundido se recicla con una proporción de refresco para mantener propiedades.',
    },
  },
  {
    id: 4,
    title: 'Implante acetabular de cadera',
    tag: 'Médico · Ti-6Al-4V · malla trabecular',
    scenario:
      'Copa acetabular de titanio con malla trabecular porosa (poros ≈ 500–700 µm, 60–80 % de porosidad) en la cara de contacto con el hueso para favorecer la osteointegración. Producción personalizada por paciente.',
    needs: ['Estructuras reticulares porosas imposibles de mecanizar', 'Titanio biocompatible, baja contaminación', 'Series cortas personalizadas'],
    options: [
      {
        name: 'EBM / DMLS (Ti-6Al-4V)',
        why: 'Correcto: fusión por haz de electrones o láser en cama de polvo que fabrica malla trabecular y copa densa en una sola pieza, con control de oxígeno.',
      },
      {
        name: 'DED',
        why: 'La resolución es demasiado gruesa para trabéculas de 0,5 mm y no hay cama de polvo que sostenga la malla.',
      },
      {
        name: 'Binder Jetting de arena',
        why: 'Material inadecuado: no es un implante metálico biocompatible ni tiene la resistencia estructural requerida.',
      },
      {
        name: 'FDM de PEEK',
        why: 'PEEK es biocompatible, pero no genera la malla trabecular de titanio ni la osteointegración buscada, y su rigidez y fricción difieren.',
      },
    ],
    correct: 0,
    just: {
      Económica: 'Personalización por paciente sin matricería y eliminación del recubrimiento poroso por plasma spray: la malla se fabrica integrada. El costo del polvo (Ti) y de validación es alto, pero justificado por valor del implante.',
      Térmica: 'EBM trabaja con la cama precalentada a ~ 700 °C y en vacío: tensiones residuales bajas, menos soportes y protección frente al O₂ (el Ti es reactivo). DMLS en argón necesita soportes y alivio de tensiones.',
      Metalúrgica: 'Ti-6Al-4V ELI: DMLS genera martensita α′ (requiere tratamiento/HIP para recuperar ductilidad); EBM produce α+β más estable. La malla con rigidez cercana al hueso (3–10 GPa) reduce el stress shielding. Control de polvo atrapado y certificación (ISO 13485, ASTM F3001).',
    },
  },
  {
    id: 5,
    title: 'Prototipo estético multimaterial a color',
    tag: 'Prototipado · validación ergonómica',
    scenario:
      'El área de diseño necesita un prototipo ergonómico de un dispositivo manual con zonas rígidas, zonas blandas tipo goma y logotipos a color, para validación con usuarios en 48 h. No tendrá cargas funcionales.',
    needs: ['Múltiples materiales y durezas en una pieza', 'Color en el mismo proceso', 'Alta calidad superficial, sin función estructural'],
    options: [
      {
        name: 'PolyJet / Binder Jetting a color',
        why: 'Correcto: PolyJet (Material Jetting) mezcla fotopolímeros rígidos y elastoméricos de 27 a 95 Shore A con color; el Binder Jetting a color ofrece modelos conceptuales económicos.',
      },
      {
        name: 'SLS PA12',
        why: 'Un solo material y color gris: no reproduce zonas blandas ni gráficos sin pintar y postprocesar.',
      },
      {
        name: 'FDM monocolor',
        why: 'Textura de capas visible y limitada a uno o dos materiales; no logra gradientes de dureza ni color integrado.',
      },
      {
        name: 'SLM de acero inoxidable',
        why: 'Costo, tiempo y postprocesado (EDM, tratamientos) completamente fuera de proporción para un modelo ergonómico no funcional.',
      },
    ],
    correct: 0,
    just: {
      Económica: 'Evita iterar pintado y ensamblado manual de varias piezas: el prototipo sale terminado en un solo build. Cada iteración cuesta mucho menos que un modelo maquinado o una matriz de silicona.',
      Térmica: 'Proceso a baja temperatura (curado UV por lámpara en PolyJet; curado de binder en Binder Jetting): sin tensiones residuales ni alabeo, ideal para geometrías finas y tolerancias de ± 0,1 mm.',
      Metalúrgica: 'No hay metalurgia: es química de fotopolímeros. Las piezas son frágiles y pierden propiedades con UV y humedad, por eso sirven para validación estética/ergonómica y no para ensayo funcional.',
    },
  },
]
