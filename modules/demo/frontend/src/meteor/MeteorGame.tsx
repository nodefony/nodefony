import { useCallback, useEffect, useRef, useState } from "react";
import {
  createCommandSender,
  type ICommandSender,
} from "../game/commandSender";
import { randomTag } from "../game/gameSocket";
import {
  SnapshotBuffer,
  extrapolate,
  interpolateById,
  lerp,
  lerpAngle,
} from "../game/snapshots";
import { displayPrefs, useElementSize, useGameLoop } from "../game/useGameLoop";
import { meterWire, type IWireStats } from "../game/wireMeter";
import { WireHud, type IHudRow } from "../game/WireHud";
import {
  openMeteor,
  sendAim,
  watchMeteor,
  type IMeteorWorld,
} from "./meteorClient";
import {
  CANNON_FIRING,
  CANNON_ROBOT,
  METEOR_HZ,
  SHOT_SPEED,
  type IMeteorAim,
} from "./meteorDemo";
import {
  createMeteorScene,
  type IBoomDrawn,
  type IMeteorScene,
} from "./meteorScene";

/** Ce que le bandeau du haut affiche, relu quatre fois par seconde. */
interface IBoard {
  wave: number;
  health: number;
  score: number;
  best: number;
  pilots: number;
  phase: "play" | "fallen";
  seated: boolean;
}

/** Vitesse de visée au clavier, radians par seconde. */
const KEY_TURN = 3;

/**
 * L'écran de Météores : la socket, l'interpolation, la visée, la scène.
 *
 * Guide pour un agent : tout ce qui est commun aux jeux vient de `game/` ; ce
 * composant n'assemble que ce qui est propre à Météores. Un visiteur qui
 * REGARDE ne prend pas de canon : sa première visée l'assoit (l'étiquette
 * `tag` lui fait reconnaître le sien dans la trame).
 */
export function MeteorGame() {
  const box = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const scene = useRef<IMeteorScene | null>(null);
  const buffer = useRef(new SnapshotBuffer<IMeteorWorld>(METEOR_HZ));
  const booms = useRef<IBoomDrawn[]>([]);
  const tag = useRef(randomTag());
  const aim = useRef<IMeteorAim | null>(null);
  const keys = useRef({ left: false, right: false });
  const [board, setBoard] = useState<IBoard | null>(null);
  const [link] = useState(() => openMeteor());
  // Créés DANS l'effet : en mode strict, React démonte puis remonte, et un
  // compteur ou une minuterie créés une seule fois resteraient arrêtés.
  const meter = useRef<ReturnType<typeof meterWire> | null>(null);
  const sender = useRef<ICommandSender<IMeteorAim> | null>(null);

  useEffect(() => {
    const element = canvas.current;
    if (element === null) return;
    meter.current = meterWire(link.tap);
    sender.current = createCommandSender<IMeteorAim>(
      (command) => sendAim(link.socket, command),
      (a, b) =>
        a.fire === b.fire &&
        Math.abs(a.angle - b.angle) < 0.01 &&
        a.tag === b.tag,
    );
    scene.current = createMeteorScene(element, displayPrefs());
    const stop = watchMeteor(link.socket, (world) => {
      buffer.current.push(world, performance.now());
      for (const boom of world.booms) booms.current.push(boom);
    });
    link.socket.connect().catch(() => {
      // La reconnexion automatique réessaie ; le bandeau reste « connexion… ».
    });
    const timer = setInterval(() => {
      const last = buffer.current.latest()?.data;
      if (last === undefined) return;
      setBoard({
        wave: last.frame.wave,
        health: last.frame.health,
        score: last.frame.score,
        best: last.frame.best,
        pilots: last.frame.pilots,
        phase: last.frame.phase,
        seated: aim.current !== null,
      });
    }, 250);
    return () => {
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

  /** La visée change : elle part, au rythme que le serveur peut lire. */
  const steer = useCallback((angle: number, fire: boolean) => {
    aim.current = { angle, fire, tag: tag.current };
    sender.current?.update(aim.current);
  }, []);

  useGameLoop((dt, now) => {
    const view = scene.current;
    if (view === null) return;
    const turn = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
    if (turn !== 0) {
      const current = aim.current;
      steer(
        (current?.angle ?? -Math.PI / 2) + turn * KEY_TURN * dt,
        current?.fire ?? false,
      );
    }
    const pair = buffer.current.pair(now);
    if (pair === null) return;
    const { from, to, k } = pair;
    // L'instant affiché, en secondes après la trame `from`.
    const since = ((to.at - from.at) * k) / 1000;
    view.render(
      {
        meteors: interpolateById(
          from.data.meteors,
          to.data.meteors,
          k,
          (a, b, t) => ({
            ...b,
            x: lerp(a.x, b.x, t),
            y: lerp(a.y, b.y, t),
          }),
        ),
        shots: from.data.shots.map((shot) => ({
          ...extrapolate(shot.x, shot.y, shot.angle, SHOT_SPEED, since),
          angle: shot.angle,
        })),
        cannons: to.data.cannons.map((cannon) => {
          const before = from.data.cannons.find((c) => c.slot === cannon.slot);
          return {
            angle:
              before === undefined
                ? cannon.angle
                : lerpAngle(before.angle, cannon.angle, k),
            slot: cannon.slot,
            robot: (cannon.flags & CANNON_ROBOT) !== 0,
            firing: (cannon.flags & CANNON_FIRING) !== 0,
            mine:
              (cannon.flags & CANNON_ROBOT) === 0 && cannon.tag === tag.current,
          };
        }),
        booms: booms.current.splice(0),
        health: to.data.frame.health,
        phase: to.data.frame.phase,
        aim: aim.current?.angle ?? null,
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
    const robots = last.cannons.filter(
      (c) => (c.flags & CANNON_ROBOT) !== 0,
    ).length;
    return [
      { label: "météores", value: String(last.meteors.length) },
      { label: "tirs en vol", value: String(last.shots.length) },
      {
        label: "canons",
        value: `${last.frame.pilots} humain(s), ${robots} robot(s)`,
      },
      { label: "retard de boucle serveur", value: `${last.frame.lag} ms` },
      {
        label: "retard d'affichage",
        value: `${Math.round(buffer.current.delayMs)} ms`,
      },
    ];
  }, []);

  return (
    <section className="game-stage meteor-stage" aria-label="Météores : le jeu">
      <div className="game-board" aria-live="polite">
        {board === null ? (
          <span>Connexion…</span>
        ) : (
          <>
            <span className="game-chip">Vague {board.wave}</span>
            <span
              className="game-health"
              // Une jauge se dit `meter` (WAI-ARIA 1.2) : sans rôle, un
              // `aria-label` sur un `span` n'est lu par personne.
              role="meter"
              aria-label="Planète"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={board.health}
              aria-valuetext={`${board.health} sur 100`}
            >
              <span style={{ inlineSize: `${board.health}%` }} />
            </span>
            <span className="game-chip">Score {board.score}</span>
            <span className="game-chip">Record : vague {board.best}</span>
            <span className="game-chip">
              {board.pilots} joueur{board.pilots > 1 ? "s" : ""}
            </span>
          </>
        )}
      </div>
      <div className="game-canvas" ref={box}>
        <canvas
          ref={canvas}
          tabIndex={0}
          aria-label="Le ciel : vise avec la souris ou le doigt, clique pour tirer ; au clavier, flèches gauche et droite, Espace pour tirer"
          onPointerMove={(event) => {
            const angle = scene.current?.angleAt(event.clientX, event.clientY);
            if (angle !== undefined) steer(angle, aim.current?.fire ?? false);
          }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            const angle = scene.current?.angleAt(event.clientX, event.clientY);
            if (angle !== undefined) steer(angle, true);
          }}
          onPointerUp={() => {
            if (aim.current !== null) steer(aim.current.angle, false);
          }}
          onPointerCancel={() => {
            if (aim.current !== null) steer(aim.current.angle, false);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") keys.current.left = true;
            else if (event.key === "ArrowRight") keys.current.right = true;
            else if (event.key === " ")
              steer(aim.current?.angle ?? -Math.PI / 2, true);
            else return;
            event.preventDefault();
          }}
          onKeyUp={(event) => {
            if (event.key === "ArrowLeft") keys.current.left = false;
            else if (event.key === "ArrowRight") keys.current.right = false;
            else if (event.key === " " && aim.current !== null)
              steer(aim.current.angle, false);
          }}
        />
        {board !== null && !board.seated ? (
          <p className="game-hint">
            Bouge la souris sur le ciel pour prendre un canon, clique pour
            tirer.
          </p>
        ) : null}
        {board?.phase === "fallen" ? (
          <p className="game-banner">
            La planète est tombée à la vague {board.wave}. Nouvelle partie dans
            un instant.
          </p>
        ) : null}
        <WireHud read={readWire} extra={extra} />
      </div>
    </section>
  );
}
