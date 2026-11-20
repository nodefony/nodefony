import { useCallback, useEffect, useRef, useState } from "react";
import {
  createCommandSender,
  type ICommandSender,
} from "../game/commandSender";
import { randomTag } from "../game/gameSocket";
import { SnapshotBuffer, interpolateById, lerp } from "../game/snapshots";
import { displayPrefs, useElementSize, useGameLoop } from "../game/useGameLoop";
import { meterWire, type IWireStats } from "../game/wireMeter";
import { WireHud, type IHudRow } from "../game/WireHud";
import {
  openPrism,
  sendSteer,
  watchPrism,
  type IPrismWorld,
} from "./prismClient";
import {
  PRISM_HZ,
  prismTeamColors,
  prismTeamNames,
  prismTiles,
  type IPrismSteer,
} from "./prismDemo";
import type { IPrismScene } from "./prismScene";

/** Ce que le bandeau affiche, relu quatre fois par seconde. */
interface IBoard {
  round: number;
  left: number;
  scores: number[];
  phase: "play" | "podium";
  winner: number;
  pilots: number;
  /** L'équipe du joueur, s'il pilote un drone. */
  team: number | null;
}

/** Une couleur d'équipe, pour le CSS. */
const teamCss = (team: number) =>
  `#${(prismTeamColors[team] ?? 0xffffff).toString(16).padStart(6, "0")}`;

/** Glisser de ce nombre de pixels = pleine vitesse. */
const DRAG_FULL = 60;

/**
 * L'écran de Prisme : la socket, l'interpolation, la direction, la scène 3D.
 *
 * Guide pour un agent : le même assemblage que `meteor/MeteorGame.tsx` — tout
 * le commun vient de `game/`. La scène 3D (`prismScene.ts`, Three.js) est
 * chargée par `import()` : la bibliothèque n'est payée que sur cette page.
 */
export function PrismGame() {
  const box = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const scene = useRef<IPrismScene | null>(null);
  const buffer = useRef(new SnapshotBuffer<IPrismWorld>(PRISM_HZ));
  const tag = useRef(randomTag());
  const steerRef = useRef<IPrismSteer | null>(null);
  const keys = useRef(new Set<string>());
  const drag = useRef<{ x: number; y: number } | null>(null);
  const meter = useRef<ReturnType<typeof meterWire> | null>(null);
  const sender = useRef<ICommandSender<IPrismSteer> | null>(null);
  const [board, setBoard] = useState<IBoard | null>(null);
  const [ready, setReady] = useState(false);
  const [link] = useState(() => openPrism());

  useEffect(() => {
    const element = canvas.current;
    if (element === null) return;
    let alive = true;
    meter.current = meterWire(link.tap);
    sender.current = createCommandSender<IPrismSteer>(
      (command) => sendSteer(link.socket, command),
      (a, b) =>
        Math.abs(a.dx - b.dx) < 0.02 &&
        Math.abs(a.dz - b.dz) < 0.02 &&
        a.tag === b.tag,
    );
    // La 3D arrive après le reste : la page et la socket n'attendent pas Three.js.
    import("./prismScene")
      .then(({ createPrismScene }) => {
        if (!alive) return;
        scene.current = createPrismScene(element, displayPrefs());
        const rect = element.getBoundingClientRect();
        scene.current.resize(rect.width, rect.height);
        setReady(true);
      })
      .catch(() => setReady(false));
    const stop = watchPrism(link.socket, (world) => {
      buffer.current.push(world, performance.now());
    });
    link.socket.connect().catch(() => {
      // La reconnexion automatique réessaie ; le bandeau reste « connexion… ».
    });
    const timer = setInterval(() => {
      const last = buffer.current.latest()?.data;
      if (last === undefined) return;
      const mine = last.drones.find((d) => d.tag === tag.current);
      setBoard({
        round: last.frame.round,
        left: last.frame.left,
        scores: last.frame.scores,
        phase: last.frame.phase,
        winner: last.frame.winner,
        pilots: last.frame.pilots,
        team: mine?.team ?? null,
      });
    }, 250);
    return () => {
      alive = false;
      clearInterval(timer);
      stop();
      sender.current?.dispose();
      sender.current = null;
      meter.current?.stop();
      meter.current = null;
      link.socket.disconnect();
      scene.current?.dispose();
      scene.current = null;
    };
  }, [link]);

  useElementSize(box, (width, height) => scene.current?.resize(width, height));

  /** La direction voulue part au rythme que le serveur peut lire. */
  const steer = useCallback((dx: number, dz: number) => {
    steerRef.current = { dx, dz, tag: tag.current };
    sender.current?.update(steerRef.current);
  }, []);

  useGameLoop((dt, now) => {
    if (drag.current === null && keys.current.size > 0) {
      const k = keys.current;
      const dx =
        (k.has("ArrowRight") || k.has("d") ? 1 : 0) -
        (k.has("ArrowLeft") || k.has("q") || k.has("a") ? 1 : 0);
      const dz =
        (k.has("ArrowDown") || k.has("s") ? 1 : 0) -
        (k.has("ArrowUp") || k.has("z") || k.has("w") ? 1 : 0);
      const len = Math.hypot(dx, dz) || 1;
      steer(dx / len, dz / len);
    }
    const view = scene.current;
    const pair = buffer.current.pair(now);
    if (view === null || pair === null) return;
    const { from, to, k } = pair;
    view.render(
      {
        tiles: to.data.frame.tiles,
        drones: interpolateById(
          from.data.drones,
          to.data.drones,
          k,
          (a, b, t) => ({
            ...b,
            x: lerp(a.x, b.x, t),
            z: lerp(a.z, b.z, t),
          }),
        ).map((d) => ({
          id: d.id,
          team: d.team,
          x: d.x,
          z: d.z,
          mine: d.tag === tag.current,
        })),
        phase: to.data.frame.phase,
        winner: to.data.frame.winner,
      },
      dt,
    );
  });

  const readWire = useCallback(
    (): IWireStats | null => meter.current?.stats() ?? null,
    [],
  );
  const extra = useCallback((): readonly IHudRow[] => {
    const last = buffer.current.latest()?.data;
    if (last === undefined) return [];
    return [
      { label: "cases", value: String(prismTiles.length) },
      {
        label: "drones",
        value: `${last.frame.pilots} humain(s), ${last.drones.length - last.frame.pilots} robot(s)`,
      },
      { label: "retard de boucle serveur", value: `${last.frame.lag} ms` },
      {
        label: "retard d'affichage",
        value: `${Math.round(buffer.current.delayMs)} ms`,
      },
    ];
  }, []);

  const release = () => {
    drag.current = null;
    if (steerRef.current !== null) steer(0, 0);
  };

  return (
    <section className="game-stage prism-stage" aria-label="Prisme : le jeu">
      <div className="game-board" aria-live="polite">
        {board === null ? (
          <span>Connexion…</span>
        ) : (
          <>
            <span className="game-chip">Manche {board.round}</span>
            <span className="game-chip">
              {board.phase === "play" ? `${board.left} s` : "Podium"}
            </span>
            {board.scores.map((score, team) => (
              <span
                key={prismTeamNames[team] ?? team}
                className="game-chip game-team"
                style={{ color: teamCss(team) }}
              >
                {prismTeamNames[team]} {score}
                {board.team === team ? " · toi" : ""}
              </span>
            ))}
          </>
        )}
      </div>
      <div className="game-canvas" ref={box}>
        <canvas
          ref={canvas}
          tabIndex={0}
          aria-label="L'arène : glisse le doigt ou la souris dans une direction, ou utilise les flèches, pour piloter ton drone"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerMove={(event) => {
            const start = drag.current;
            if (start === null) return;
            const dx = (event.clientX - start.x) / DRAG_FULL;
            const dz = (event.clientY - start.y) / DRAG_FULL;
            const len = Math.hypot(dx, dz);
            if (len < 0.15) return;
            steer(dx / Math.max(1, len), dz / Math.max(1, len));
          }}
          onPointerUp={release}
          onPointerCancel={release}
          onKeyDown={(event) => {
            const key =
              event.key.length === 1 ? event.key.toLowerCase() : event.key;
            if (!/^(Arrow(Up|Down|Left|Right)|[zqsdwa])$/.test(key)) return;
            keys.current.add(key);
            event.preventDefault();
          }}
          onKeyUp={(event) => {
            const key =
              event.key.length === 1 ? event.key.toLowerCase() : event.key;
            keys.current.delete(key);
            if (keys.current.size === 0) release();
          }}
        />
        {!ready ? <p className="game-hint">Chargement de la 3D…</p> : null}
        {ready && board !== null && board.team === null ? (
          <p className="game-hint">
            Glisse sur l'arène, ou clique puis utilise les flèches : un drone
            t'attend.
          </p>
        ) : null}
        {board?.phase === "podium" ? (
          <p className="game-banner" style={{ color: teamCss(board.winner) }}>
            {prismTeamNames[board.winner] ?? "Personne"} gagne la manche{" "}
            {board.round}
          </p>
        ) : null}
        <WireHud read={readWire} extra={extra} />
      </div>
    </section>
  );
}
