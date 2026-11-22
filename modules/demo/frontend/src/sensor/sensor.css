/*
 * Sonde — styles des FIGURES seulement : les graphes SVG (`SensorCharts.tsx`)
 * et la sphère de Bloch (`BlochView.tsx`). Classes préfixées `sensor-` ;
 * chaque couleur vient d'un jeton de `demo.css` (`--blue`, `--muted`, `--fg`…),
 * les teintes de zone s'en DÉDUISENT par `color-mix` : elles suivent donc le
 * thème clair ou sombre sans une seconde palette. Le texte des SVG passe par
 * `--muted` ou `--fg` — jamais une teinte d'accent seule, trop pâle en sombre.
 * Importée par la page : `import "./sensor.css"`.
 */

/* ── Graphes SVG ─────────────────────────────────────────────────────────── */
.sensor-chart {
  --sensor-zone-a: color-mix(in srgb, var(--green) 11%, transparent);
  --sensor-zone-c: color-mix(in srgb, var(--amber) 14%, transparent);
  --sensor-zone-d: color-mix(in srgb, var(--danger) 11%, transparent);
  --sensor-band: color-mix(in srgb, var(--blue) 20%, transparent);
  display: block;
  inline-size: 100%;
  max-inline-size: 100%;
  block-size: auto;
  overflow: visible;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.sensor-chart text {
  fill: var(--muted);
}
.sensor-chart .sensor-ink {
  fill: var(--fg);
}
/* Une étiquette posée SUR les données : un halo couleur de carte la détache. */
.sensor-chart .sensor-halo {
  paint-order: stroke;
  stroke: var(--card);
  stroke-width: 3px;
  stroke-linejoin: round;
}
.sensor-chart .sensor-grid {
  stroke: var(--border);
  stroke-width: 1;
}

/* ── Sphère de Bloch ─────────────────────────────────────────────────────── */
.sensor-bloch-view {
  display: grid;
  gap: 8px;
  min-inline-size: 0;
}
.sensor-bloch {
  position: relative;
  inline-size: 100%;
  max-inline-size: 420px;
  aspect-ratio: 1;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-soft);
  overflow: hidden;
  /* Le doigt tourne la sphère : le défilement de la page ne lui est pas disputé. */
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.sensor-bloch canvas {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  outline: none;
  cursor: grab;
}
.sensor-bloch canvas:active {
  cursor: grabbing;
}
.sensor-bloch canvas:focus-visible {
  box-shadow: inset 0 0 0 2px var(--cyan);
}
.sensor-bloch-fallback {
  position: absolute;
  inset: 0;
  margin: 0;
  display: grid;
  place-items: center;
  padding: 16px;
  text-align: center;
  color: var(--muted);
  font-size: 0.9rem;
  pointer-events: none;
}
.sensor-bloch-readout {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.sensor-bloch-readout b {
  color: var(--fg);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-weight: 600;
}
