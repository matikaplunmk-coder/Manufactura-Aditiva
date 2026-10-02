# Manufactura Aditiva · ISO/ASTM 52900

Aplicación web didáctica para la cátedra de Tecnología de Fabricación (Ing. Mecánica, 5.° año, UTN FRC).
Stack: Vite + React + Tailwind CSS + Lucide Icons. Animaciones en HTML5 Canvas (sin librerías 3D).

1. **Simulador Cinemático 2D** – FDM (Direct Drive / Bowden), SLS/SLM (ciclo de 4 fases), SLA vs CLIP (zona muerta), DED híbrido, más slider de espesor de capa (efecto escalera, Ra y tiempo).
2. **Matriz de Decisión y Postproceso** – filtros de material, solicitación, geometría y acabado → tecnología, soportes, isotropía y cadena de postproceso.
3. **Taller DfAM y Casos de Planta** – simulador de orientación (0°/45°/90°) y 5 casos de estudio con retroalimentación.

```bash
npm install
npm run dev     # desarrollo
npm run build   # producción en dist/
```

Los valores numéricos son modelos didácticos orientativos.
