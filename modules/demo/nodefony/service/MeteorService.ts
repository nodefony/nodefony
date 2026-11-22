import { Module, Service, injectable } from "nodefony";
import { GameRoom, type IGamePilot, type IGameRules } from "../game/GameRoom";
import {
  AimParams,
  BOOM_METEOR,
  BOOM_PLANET,
  boomRecord,
  CANNON_FIRING,
  cannonRecord,
  CANNON_ROBOT,
  DEFENDERS,
  FIELD_RADIUS,
  MAX_METEORS,
  MAX_PILOTS,
  MAX_SHOTS,
  METEOR_HZ,
  meteorRecord,
  PLANET_RADIUS,
  RING_RADIUS,
  shotRecord,
  SHOT_SPEED,
  type IMeteorAim,
  type IMeteorFrame,
} from "../../frontend/src/meteor/meteorDemo";

/**
 * Météores — les RÈGLES du jeu, branchées sur la salle commune (`GameRoom`).
 *
 * Guide pour un agent : la salle porte qui joue, les robots, la boucle et la
 * publication ; ce service ne porte que le monde (météores, tirs, planète) et
 * ce qui le fait avancer. Le serveur décide de TOUT contact : un tir touche
 * parce que le serveur l'a vu toucher, jamais parce qu'une page l'affirme.
 * UN exemplaire par processus (`@injectable`, déclaré dans `@services`).
 */

/** Durée d'une vague, en secondes. */
const WAVE_SECONDS = 20;
/** Durée d'affichage de la planète tombée, avant la partie suivante. */
const FALLEN_SECONDS = 5;
/** Vitesse de rotation d'un canon, radians par seconde : humain, robot. */
const HUMAN_TURN = 7;
const ROBOT_TURN = 3.6;
/** Délai entre deux tirs, en secondes : humain, robot. */
const HUMAN_COOLDOWN = 0.11;
const ROBOT_COOLDOWN = 0.17;
/** Un gros météore se brise en deux à partir de ce rayon. */
const SPLIT_RADIUS = 15;
/** Vie rendue à la planète à chaque vague franchie. */
const WAVE_REPAIR = 15;

/** Un canon : la place et l'étiquette viennent de la salle. */
export interface IMeteorPilot extends IGamePilot {
  angle: number;
  /** L'angle visé : le canon y glisse à sa vitesse de rotation. */
  target: number;
  trigger: boolean;
  cooldown: number;
  /** A tiré pendant ce tour : la page allume la bouche du canon. */
  fired: boolean;
}

interface IMeteor {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hp: number;
}

interface IShot {
  x: number;
  y: number;
  angle: number;
}

interface IBoom {
  x: number;
  y: number;
  size: number;
  kind: number;
}

/** L'écart signé le plus court entre deux angles. */
function angleDelta(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

// #region meteor-rules
/** Le monde de Météores et ses règles : ce que `GameRoom` appelle à chaque tour. */
export class MeteorRules implements IGameRules<
  IMeteorPilot,
  IMeteorAim,
  IMeteorFrame
> {
  readonly hz = METEOR_HZ;
  readonly seats = MAX_PILOTS;
  readonly crew = DEFENDERS;

  meteors: IMeteor[] = [];
  shots: IShot[] = [];
  booms: IBoom[] = [];
  wave = 1;
  health = 100;
  score = 0;
  best = 1;
  phase: "play" | "fallen" = "play";
  #phaseLeft = 0;
  #waveTime = 0;
  #spawn = 0;
  #nextId = 1;
  #humans = 0;

  parse(params: unknown): IMeteorAim | null {
    const result = AimParams.safeParse(params);
    return result.success ? result.data : null;
  }

  createPilot(slot: number, robot: boolean): IMeteorPilot {
    const angle = (slot / DEFENDERS) * Math.PI * 2 - Math.PI / 2;
    return {
      slot,
      robot,
      tag: 0,
      angle,
      target: angle,
      trigger: false,
      cooldown: 0,
      fired: false,
    };
  }

  apply(pilot: IMeteorPilot, aim: IMeteorAim): void {
    pilot.target = aim.angle;
    pilot.trigger = aim.fire;
  }

  step(pilots: readonly IMeteorPilot[], dt: number): void {
    this.#humans = pilots.filter((p) => !p.robot).length;
    if (this.phase === "fallen") {
      this.#phaseLeft -= dt;
      if (this.#phaseLeft <= 0) this.#restart();
      return;
    }
    this.#waves(dt);
    this.#moveMeteors(dt);
    this.#aimRobots(pilots);
    this.#fire(pilots, dt);
    this.#moveShots(dt);
    this.#collide();
  }

  frame(
    pilots: readonly IMeteorPilot[],
    seq: number,
    lagMs: number,
  ): IMeteorFrame {
    const frame: IMeteorFrame = {
      seq,
      phase: this.phase,
      wave: this.wave,
      health: this.health,
      score: this.score,
      best: this.best,
      pilots: this.#humans,
      lag: Math.round(lagMs * 10) / 10,
      meteors: meteorRecord.write(this.meteors),
      shots: shotRecord.write(this.shots),
      cannons: cannonRecord.write(
        pilots.map((p) => ({
          angle: p.angle,
          tag: p.tag,
          slot: p.slot,
          flags: (p.robot ? CANNON_ROBOT : 0) | (p.fired ? CANNON_FIRING : 0),
        })),
      ),
      booms: boomRecord.write(this.booms),
    };
    // Une explosion part UNE fois, dans la trame du tour qui l'a vue.
    this.booms.length = 0;
    return frame;
  }
  // #endregion

  /** Les vagues : plus denses, plus rapides, toutes les `WAVE_SECONDS`. */
  #waves(dt: number): void {
    this.#waveTime += dt;
    if (this.#waveTime >= WAVE_SECONDS) {
      this.#waveTime = 0;
      this.wave += 1;
      this.best = Math.max(this.best, this.wave);
      this.health = Math.min(100, this.health + WAVE_REPAIR);
    }
    this.#spawn += (1.2 + this.wave * 1.1) * dt;
    while (this.#spawn >= 1) {
      this.#spawn -= 1;
      if (this.meteors.length < MAX_METEORS) this.#spawnMeteor();
    }
  }

  #spawnMeteor(): void {
    const from = Math.random() * Math.PI * 2;
    const x = Math.cos(from) * FIELD_RADIUS;
    const y = Math.sin(from) * FIELD_RADIUS;
    // Vise un point de la planète, pas son centre : les trajectoires se croisent.
    const aim = Math.random() * Math.PI * 2;
    const reach = Math.random() * PLANET_RADIUS * 0.9;
    const tx = Math.cos(aim) * reach - x;
    const ty = Math.sin(aim) * reach - y;
    const len = Math.hypot(tx, ty);
    const speed = 30 + this.wave * 5 + Math.random() * 25;
    const big = Math.random() < 0.18;
    const r = big ? 16 + Math.random() * 6 : 6 + Math.random() * 7;
    this.meteors.push({
      id: this.#nextId,
      x,
      y,
      vx: (tx / len) * speed,
      vy: (ty / len) * speed,
      r,
      hp: big ? 3 : 1,
    });
    this.#nextId = (this.#nextId % 65_535) + 1;
  }

  #moveMeteors(dt: number): void {
    let kept = 0;
    for (const m of this.meteors) {
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (Math.hypot(m.x, m.y) < PLANET_RADIUS + m.r * 0.4) {
        this.health = Math.max(0, this.health - Math.ceil(m.r / 8));
        this.booms.push({ x: m.x, y: m.y, size: m.r * 2, kind: BOOM_PLANET });
        continue;
      }
      this.meteors[kept++] = m;
    }
    this.meteors.length = kept;
    if (this.health === 0) {
      this.phase = "fallen";
      this.#phaseLeft = FALLEN_SECONDS;
      this.shots.length = 0;
    }
  }

  /** Chaque robot vise le météore le plus proche que personne d'autre ne vise. */
  #aimRobots(pilots: readonly IMeteorPilot[]): void {
    const claimed = new Set<number>();
    for (const pilot of pilots) {
      if (!pilot.robot) continue;
      let best: IMeteor | null = null;
      let bestDistance = FIELD_RADIUS * 0.85;
      for (const m of this.meteors) {
        if (claimed.has(m.id)) continue;
        const distance = Math.hypot(m.x, m.y);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = m;
        }
      }
      if (best === null) {
        pilot.trigger = false;
        continue;
      }
      claimed.add(best.id);
      pilot.target = Math.atan2(best.y, best.x);
      pilot.trigger = Math.abs(angleDelta(pilot.angle, pilot.target)) < 0.06;
    }
  }

  #fire(pilots: readonly IMeteorPilot[], dt: number): void {
    for (const pilot of pilots) {
      const turn = (pilot.robot ? ROBOT_TURN : HUMAN_TURN) * dt;
      const delta = angleDelta(pilot.angle, pilot.target);
      pilot.angle += Math.max(-turn, Math.min(turn, delta));
      pilot.cooldown -= dt;
      pilot.fired = false;
      if (
        pilot.trigger &&
        pilot.cooldown <= 0 &&
        this.shots.length < MAX_SHOTS
      ) {
        this.shots.push({
          x: Math.cos(pilot.angle) * RING_RADIUS,
          y: Math.sin(pilot.angle) * RING_RADIUS,
          angle: pilot.angle,
        });
        pilot.cooldown = pilot.robot ? ROBOT_COOLDOWN : HUMAN_COOLDOWN;
        pilot.fired = true;
      }
    }
  }

  #moveShots(dt: number): void {
    let kept = 0;
    for (const s of this.shots) {
      s.x += Math.cos(s.angle) * SHOT_SPEED * dt;
      s.y += Math.sin(s.angle) * SHOT_SPEED * dt;
      if (Math.hypot(s.x, s.y) <= FIELD_RADIUS + 20) this.shots[kept++] = s;
    }
    this.shots.length = kept;
  }

  /** Tirs contre météores : le serveur seul décide d'un contact. */
  #collide(): void {
    const born: IMeteor[] = [];
    let keptShots = 0;
    for (const s of this.shots) {
      let hit = false;
      for (const m of this.meteors) {
        if (m.hp === 0) continue;
        const dx = m.x - s.x;
        const dy = m.y - s.y;
        if (dx * dx + dy * dy < (m.r + 4) ** 2) {
          m.hp -= 1;
          hit = true;
          if (m.hp === 0) this.#destroy(m, born);
          break;
        }
      }
      if (!hit) this.shots[keptShots++] = s;
    }
    this.shots.length = keptShots;
    let kept = 0;
    for (const m of this.meteors) if (m.hp > 0) this.meteors[kept++] = m;
    this.meteors.length = kept;
    for (const m of born) {
      if (this.meteors.length < MAX_METEORS) this.meteors.push(m);
    }
  }

  #destroy(m: IMeteor, born: IMeteor[]): void {
    this.score += m.r >= SPLIT_RADIUS ? 30 : 10;
    this.booms.push({ x: m.x, y: m.y, size: m.r * 2, kind: BOOM_METEOR });
    if (m.r < SPLIT_RADIUS) return;
    // Un gros météore se brise en deux éclats qui s'écartent.
    for (const side of [-0.5, 0.5]) {
      const cos = Math.cos(side);
      const sin = Math.sin(side);
      born.push({
        id: this.#nextId,
        x: m.x,
        y: m.y,
        vx: (m.vx * cos - m.vy * sin) * 1.15,
        vy: (m.vx * sin + m.vy * cos) * 1.15,
        r: m.r * 0.5,
        hp: 1,
      });
      this.#nextId = (this.#nextId % 65_535) + 1;
    }
  }

  #restart(): void {
    this.meteors.length = 0;
    this.shots.length = 0;
    this.booms.length = 0;
    this.wave = 1;
    this.health = 100;
    this.score = 0;
    this.phase = "play";
    this.#waveTime = 0;
    this.#spawn = 0;
  }
}

/** La salle de Météores, une par processus, injectée dans `MeteorController`. */
@injectable()
class MeteorService extends Service {
  readonly rules = new MeteorRules();
  readonly room = new GameRoom(this.rules);

  /**
   * @param module - le module qui le déclare ; absent dans un test, qui le
   *   construit sans kernel
   */
  constructor(module?: Module) {
    super(
      "meteor",
      module?.container ?? undefined,
      module?.notificationsCenter,
    );
  }
}

export default MeteorService;
