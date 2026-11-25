/*
 * La page gRPC (`GrpcLesson.tsx`) : la machine en direct, la trame octet par
 * octet, les refus, la suite. Tout passe par les variables de `demo.css` :
 * les deux thèmes suivent sans une ligne de plus.
 */

/* Une page à plusieurs couleurs, chacune pour UNE nature de chose : cyan
   pour le flux (courbe, socket), vert pour ce qui va bien, ambre pour la
   mesure, violet pour le protocole. Toutes mêlées au texte : le contraste
   tient dans les deux thèmes. */
.grpc-live {
  display: grid;
  gap: 12px;
  margin: 8px 0 20px;
  padding: 16px;
  background:
    radial-gradient(
      120% 90% at 100% 0%,
      color-mix(in srgb, var(--cyan) 12%, transparent),
      transparent 60%
    ),
    radial-gradient(
      90% 80% at 0% 100%,
      color-mix(in srgb, var(--violet) 10%, transparent),
      transparent 55%
    ),
    var(--card);
  border: 1px solid color-mix(in srgb, var(--cyan) 30%, var(--border));
  border-radius: 12px;
  min-width: 0;
}
.grpc-live-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.grpc-live-head h2 {
  margin: 0;
  font-size: 1.05rem;
}
.grpc-state.is-on {
  color: color-mix(in srgb, var(--green) 70%, var(--fg));
  border-color: var(--green);
  background: color-mix(in srgb, var(--green) 14%, transparent);
}
.grpc-state.is-on::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
  background: var(--green);
  animation: grpc-pulse 1.4s ease-in-out infinite;
}
@keyframes grpc-pulse {
  50% {
    opacity: 0.35;
  }
}
@media (prefers-reduced-motion: reduce) {
  .grpc-state.is-on::before {
    animation: none;
  }
}
.grpc-state.is-off {
  color: var(--muted);
}

.grpc-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin: 0;
}
.grpc-metrics div {
  display: grid;
}
.grpc-metrics dt {
  font-size: 0.78rem;
  color: var(--muted);
}
.grpc-metrics dd {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.grpc-metrics .is-last dd {
  color: color-mix(in srgb, var(--amber) 70%, var(--fg));
}
.grpc-metrics .is-count dd {
  color: color-mix(in srgb, var(--cyan) 70%, var(--fg));
}
.grpc-metrics .is-rate dd {
  color: color-mix(in srgb, var(--green) 70%, var(--fg));
}

.grpc-curve {
  margin: 0;
}
.grpc-curve svg {
  display: block;
  width: 100%;
  height: 150px;
  background: var(--bg-soft);
  border: 1px solid color-mix(in srgb, var(--cyan) 20%, var(--border));
  border-radius: 8px;
}
.grpc-curve polyline {
  stroke: var(--cyan);
  stroke-width: 2.5;
  stroke-linejoin: round;
}
.grpc-fill-top {
  stop-color: var(--cyan);
  stop-opacity: 0.35;
}
.grpc-fill-bottom {
  stop-color: var(--cyan);
  stop-opacity: 0;
}
.grpc-curve figcaption,
.grpc-log figcaption,
.grpc-wire figcaption,
.grpc-refusals figcaption {
  font-size: 0.82rem;
  color: var(--muted);
  margin-top: 4px;
}

.grpc-run p,
.grpc-step-run p {
  margin: 0 0 4px;
}
.grpc-closed {
  margin-top: 8px;
  font-weight: 600;
}

.grpc-doc {
  font-size: 0.85rem;
  color: var(--muted);
}
/* Le bleu seul passe sous 4,5:1 sur la carte en thème sombre (mesuré 3,26). */
.grpc-doc a {
  color: color-mix(in srgb, var(--blue) 50%, var(--fg));
}

.grpc-log {
  margin: 8px 0;
}
.grpc-log pre {
  border-left: 3px solid var(--cyan);
  color: color-mix(in srgb, var(--cyan) 45%, var(--fg));
  margin: 4px 0 0;
  padding: 8px 10px;
  max-height: 180px;
  overflow: auto;
  font:
    0.75rem/1.5 ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
}

/* La trame : un groupe par morceau, une couleur par nature — mêlée au texte,
   sans quoi le violet passe sous 4,5:1 en thème sombre (mesuré 3,08). */
.grpc-wire {
  margin: 8px 0;
  min-width: 0;
}
.grpc-bytes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 4px;
  margin-top: 6px;
  font:
    0.8rem/1 ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;
}
.grpc-seg {
  display: inline-block;
  padding: 4px 6px;
  border-radius: 5px;
  border: 1px solid currentColor;
}
.grpc-wire .is-envelope {
  color: color-mix(in srgb, var(--violet) 60%, var(--fg));
}
.grpc-wire .is-key {
  color: var(--muted);
}
.grpc-wire .is-text {
  color: color-mix(in srgb, var(--green) 60%, var(--fg));
}
.grpc-wire .is-number {
  color: color-mix(in srgb, var(--blue) 60%, var(--fg));
}
.grpc-wire .is-trailer {
  color: color-mix(in srgb, var(--amber) 60%, var(--fg));
}
.grpc-wire .is-rest {
  color: color-mix(in srgb, var(--danger) 60%, var(--fg));
}
.grpc-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.82rem;
  font-weight: 600;
}
.grpc-segments {
  margin: 8px 0 0;
  padding-left: 1.4rem;
  font-size: 0.8rem;
}
.grpc-segments code {
  white-space: nowrap;
}

.grpc-refusals {
  margin: 8px 0;
  min-width: 0;
  overflow-x: auto;
}
.grpc-refusals table {
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-bottom: 8px;
}
.grpc-refusals th,
.grpc-refusals td {
  text-align: left;
  padding: 4px 10px 4px 0;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

.grpc-next {
  margin: 24px 0;
}
.grpc-next-cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 16px;
}
.grpc-next article {
  min-width: 0;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--border);
  border-top: 3px solid var(--accent-norm);
  background: color-mix(in srgb, var(--accent-norm) 6%, var(--card));
}
.grpc-next .is-a2a {
  --accent-norm: var(--violet);
}
.grpc-next .is-gnmi {
  --accent-norm: var(--cyan);
}
.grpc-next h3 {
  color: color-mix(in srgb, var(--accent-norm) 55%, var(--fg));
}
.grpc-next h3 {
  font-size: 1rem;
  margin: 0 0 6px;
}

/* Les codes des refus, chacun dans la couleur de sa nature. */
.grpc-code {
  font-weight: 600;
}
.grpc-code.is-deny {
  color: color-mix(in srgb, var(--danger) 70%, var(--fg));
}
.grpc-code.is-http {
  color: color-mix(in srgb, var(--amber) 70%, var(--fg));
}
.grpc-code.is-absent {
  color: color-mix(in srgb, var(--violet) 60%, var(--fg));
}
.grpc-code.is-ok {
  color: color-mix(in srgb, var(--green) 70%, var(--fg));
}
