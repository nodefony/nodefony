/*
 * La page de la sonde (`SensorLesson.tsx`) : bancs, machines, écrans, journal,
 * chiffres. Les figures ont leur feuille (`sensor.css`). Tout passe par les
 * variables de `demo.css` : les deux thèmes suivent sans une ligne de plus.
 */

.sensor-honest {
  border-left: 3px solid var(--violet);
  background: var(--bg-soft);
  border-radius: 0 8px 8px 0;
  padding: 12px 16px;
  display: grid;
  gap: 6px;
}
.sensor-honest h2 {
  font-size: 0.95rem;
  margin: 0;
}
.sensor-honest p {
  margin: 0;
}

.sensor-benches {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  margin-top: 8px;
}
.sensor-bench-tab {
  font: inherit;
  font-weight: 600;
  color: var(--muted);
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  padding: 10px 18px;
  cursor: pointer;
}
.sensor-bench-tab[aria-selected="true"] {
  color: var(--fg);
  border-bottom-color: var(--blue);
}
.sensor-bench-tab:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: -2px;
}
.sensor-bench-text {
  color: var(--muted);
  margin: 8px 0 4px;
}

.sensor-wait {
  color: var(--muted);
}

.sensor-machines {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  gap: 10px;
}
.sensor-machine {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  padding: 10px 12px;
  display: grid;
  gap: 6px;
  min-width: 0;
}
.sensor-machine dl {
  margin: 0;
  display: grid;
  gap: 2px;
}
.sensor-machine dl > div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.sensor-machine dt {
  color: var(--muted);
}
.sensor-machine dd {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-variant-numeric: tabular-nums;
}
.sensor-machine small,
.sensor-note {
  color: var(--muted);
}
.sensor-note {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 0.85rem;
}

.sensor-screens {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  gap: 10px;
}
.sensor-screen {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  padding: 10px 12px;
  display: grid;
  gap: 4px;
  min-width: 0;
}
.sensor-screen code {
  color: var(--blue);
}
.sensor-screen span {
  font-variant-numeric: tabular-nums;
}
.sensor-screen small {
  color: var(--muted);
}
.sensor-screen.is-degraded {
  border-style: dashed;
}

.sensor-journal {
  border: 1px solid var(--border);
  border-radius: 8px;
}
.sensor-journal table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.88rem;
}
.sensor-journal caption {
  text-align: left;
  padding: 8px 10px;
  color: var(--muted);
}
.sensor-journal th,
.sensor-journal td {
  text-align: left;
  padding: 6px 10px;
  border-top: 1px solid var(--border);
  overflow-wrap: anywhere;
}
.sensor-journal th {
  color: var(--muted);
  background: var(--bg-soft);
}
.sensor-state.is-unacknowledged,
.sensor-state.is-returned {
  color: var(--danger);
  font-weight: 600;
}

.sensor-figures {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
  gap: 10px;
}
.sensor-figure {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
  display: grid;
  gap: 2px;
  min-width: 0;
}
.sensor-figure b {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-variant-numeric: tabular-nums;
  font-size: 1.05rem;
}
.sensor-figure span {
  color: var(--muted);
  font-size: 0.8rem;
}

.sensor-slider {
  display: grid;
  gap: 6px;
}
.sensor-slider input {
  width: 100%;
  accent-color: var(--blue);
}
.sensor-slider small {
  color: var(--muted);
}
