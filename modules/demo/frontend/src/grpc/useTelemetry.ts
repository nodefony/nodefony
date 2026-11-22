import { useEffect, useRef, useState } from "react";
import { followTelemetry, openTelemetry } from "./grpcClient";
import type { ITelemetryReading, TelemetryEvent } from "./grpcDemo";

/** Points de la courbe : 20 s à la cadence par défaut de la machine. */
export const CURVE_POINTS = 200;

/** Lignes gardées dans le journal de la socket. */
const LOG_LINES = 6;

/** Ce que la page sait de la machine, à l'instant du rendu. */
export interface ITelemetryView {
  /** La socket de la démo est ouverte. */
  online: boolean;
  /** Les machines dont un flux `Push` est ouvert. */
  pushing: readonly string[];
  /** La dernière mesure reçue, ou `null`. */
  last: ITelemetryReading | null;
  /** Mesures reçues depuis l'ouverture de la page. */
  received: number;
  /** Mesures reçues pendant la dernière seconde, horloge de la page. */
  rate: number;
  /** Les températures de la courbe, de la plus ancienne à la plus récente. */
  curve: readonly number[];
  /** Le dernier flux fermé, et son total. */
  closed: { machine: string; accepted: number } | null;
  /** Les dernières trames du canal, telles que la page les a reçues. */
  log: readonly string[];
}

/** L'état mutable du suivi : mis à jour EN PLACE à chaque trame. */
class TelemetryTrack {
  readonly celsius = new Float64Array(CURVE_POINTS);
  /** Instant d'arrivée de chaque point, `performance.now()` de la page. */
  readonly arrivals = new Float64Array(CURVE_POINTS);
  head = 0;
  size = 0;
  machine: string | null = null;
  received = 0;
  last: ITelemetryReading | null = null;
  pushing = new Set<string>();
  closed: { machine: string; accepted: number } | null = null;
  log: string[] = [];
  online = false;

  add(reading: ITelemetryReading): void {
    // La courbe suit UNE machine : la dernière qui a parlé.
    if (reading.machine !== this.machine) {
      this.machine = reading.machine;
      this.head = 0;
      this.size = 0;
    }
    this.celsius[this.head] = reading.celsius;
    this.arrivals[this.head] = performance.now();
    this.head = (this.head + 1) % CURVE_POINTS;
    if (this.size < CURVE_POINTS) this.size += 1;
    this.last = reading;
  }

  note(event: TelemetryEvent): void {
    this.log.push(JSON.stringify(event));
    if (this.log.length > LOG_LINES) this.log.shift();
  }

  view(): ITelemetryView {
    const curve: number[] = [];
    const now = performance.now();
    let rate = 0;
    for (let i = 0; i < this.size; i += 1) {
      const at = (this.head - this.size + i + CURVE_POINTS) % CURVE_POINTS;
      curve.push(this.celsius[at] ?? 0);
      if (now - (this.arrivals[at] ?? 0) <= 1000) rate += 1;
    }
    return {
      online: this.online,
      pushing: [...this.pushing],
      last: this.last,
      received: this.received,
      rate,
      curve,
      closed: this.closed,
      log: [...this.log],
    };
  }
}

/**
 * Suit les machines par la socket de la démo, tant que la page est ouverte.
 *
 * Guide pour un agent : le code réseau est `followTelemetry` (`grpcClient.ts`,
 * cité par la page) ; ce hook ne fait que tenir l'état. Les trames arrivent
 * à la cadence de la machine (10 par seconde par défaut) : elles s'écrivent
 * dans des tableaux typés, en place, et l'écran se redessine au plus une fois
 * par image.
 *
 * @returns ce que la page affiche
 */
export function useTelemetry(): ITelemetryView {
  const track = useRef<TelemetryTrack | null>(null);
  track.current ??= new TelemetryTrack();
  const [view, setView] = useState<ITelemetryView>(() =>
    (track.current ?? new TelemetryTrack()).view(),
  );

  useEffect(() => {
    const state = track.current;
    if (state === null) return undefined;
    const socket = openTelemetry();
    let frame = 0;
    const redraw = () => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setView(state.view());
      });
    };
    const stop = followTelemetry(
      socket,
      (event) => {
        state.note(event);
        if (event.kind === "reading") {
          state.received += 1;
          state.add(event);
        } else if (event.open) {
          state.pushing.add(event.machine);
          state.closed = null;
        } else {
          state.pushing.delete(event.machine);
          state.closed = { machine: event.machine, accepted: event.accepted };
        }
        redraw();
      },
      (snapshot) => {
        state.pushing = new Set(snapshot.pushing);
        const latest = snapshot.latest.at(-1);
        if (state.last === null && latest !== undefined) state.add(latest);
        redraw();
      },
    );
    const offState = socket.onState((value) => {
      state.online = value === "connected";
      redraw();
    });
    // La cadence se lit sur une seconde glissante : elle retombe à zéro
    // quand la machine se tait, même sans trame.
    const tick = setInterval(redraw, 1000);
    socket.connect().catch(() => {
      // Serveur injoignable : la reconnexion continue en fond.
    });
    return () => {
      clearInterval(tick);
      if (frame !== 0) cancelAnimationFrame(frame);
      offState();
      stop();
      socket.disconnect();
    };
  }, []);

  return view;
}
