import { setTimeout as sleep } from "node:timers/promises";
import {
  controller,
  Controller,
  Get,
  Headers,
  Post,
} from "@nodefony/framework";
import type { RouteInput } from "@nodefony/framework";
import type { ContextType } from "@nodefony/http";
import {
  answerWords,
  AskBody,
  BUILD_STEP_MS,
  BUILD_STEPS,
  QUIET_HEARTBEAT_MS,
  QUIET_MS,
  RESUME_BATCH,
  RESUME_LAST,
  RESUME_RETRY_MS,
  SSE_PATH,
  STEP_COUNT,
  STEP_MS,
  TICK_MS,
  WORD_MS,
  type BuildEvents,
} from "../../frontend/src/sse/sseDemo";

/**
 * Flux SSE — le serveur POUSSE des événements au navigateur sur une réponse
 * HTTP qu'il ne referme pas (`text/event-stream`). Sept gestes : ouvrir,
 * nommer et typer, reprendre après une coupure, battre le cœur, voir le
 * client partir, négocier JSON ou flux, répondre en flux à un `POST`.
 *
 * Guide pour un agent : `renderSse()` ouvre le flux, `send()` écrit un
 * événement, `close()` termine. Une route SSE reste un `GET` ou un `POST`
 * ordinaire : c'est l'ACTION qui choisit de répondre en flux. Le contrôleur
 * est un SINGLETON : rien ne se garde sur `this`. Doc :
 * `@nodefony/http/docs/sse.md`.
 *
 * Les blocs `// #region <nom>` sont CITÉS par la page d'apprentissage
 * (`frontend/src/sse/SseLesson.tsx`) : les renommer casse son test.
 */
// #region sse-class
@controller(SSE_PATH)
class SseController extends Controller {
  constructor(context: ContextType) {
    super("sse", context);
  }
  // #endregion

  // #region sse-open
  // `renderSse()` ouvre le flux : les en-têtes partent tout de
  // suite, la réponse reste ouverte. `send()` écrit un événement,
  // `close()` termine la requête.
  @Get("/steps")
  async steps() {
    const sse = await this.renderSse();
    for (let n = 1; n <= STEP_COUNT; n += 1) {
      if (n > 1) await sleep(STEP_MS);
      await sse.send(`étape ${n} sur ${STEP_COUNT}`);
    }
    return sse.close();
  }
  // #endregion

  // #region sse-named
  // Un nom par événement (`event`), et un contenu typé par la
  // carte `BuildEvents` : `{ event: "progres" }`, ou un contenu
  // de la mauvaise forme, ne compile pas.
  @Get("/build")
  async build() {
    const started = Date.now();
    const sse = await this.renderSse<BuildEvents>();
    for (const [index, step] of BUILD_STEPS.entries()) {
      await sleep(BUILD_STEP_MS);
      const percent = Math.round(((index + 1) / BUILD_STEPS.length) * 100);
      await sse.send({ step, percent }, { event: "progress" });
    }
    await sse.send({ ms: Date.now() - started }, { event: "done" });
    return sse.close();
  }
  // #endregion

  // #region sse-resume
  // Chaque événement porte un `id`. Le flux coupe tous les deux
  // événements ; le navigateur se reconnecte seul après `retry`
  // ms, en renvoyant le dernier `id` reçu dans `Last-Event-ID`.
  // Tout est envoyé : un 204, et il ne se reconnecte plus.
  @Get("/resume")
  async resume(@Headers("last-event-id") lastEventId?: string) {
    const last = Number.parseInt(lastEventId ?? "0", 10);
    const from = Number.isInteger(last) && last > 0 ? last : 0;
    if (from >= RESUME_LAST) return this.render("", "utf8", 204);
    const sse = await this.renderSse({ retry: RESUME_RETRY_MS });
    const to = Math.min(from + RESUME_BATCH, RESUME_LAST);
    for (let id = from + 1; id <= to; id += 1) {
      await sse.send(`événement ${id} sur ${RESUME_LAST}`, { id: `${id}` });
      await sleep(STEP_MS);
    }
    return sse.close();
  }
  // #endregion

  // #region sse-heartbeat
  // Un flux qui se tait : un proxy le croirait mort et le
  // couperait. Le battement — un commentaire `:` toutes les
  // `heartbeat` ms (15 s par défaut) — le garde vivant ;
  // `EventSource` l'ignore.
  @Get("/quiet")
  async quiet() {
    const sse = await this.renderSse({ heartbeat: QUIET_HEARTBEAT_MS });
    await sleep(QUIET_MS);
    await sse.send("enfin quelque chose");
    return sse.close();
  }
  // #endregion

  // #region sse-leave
  // Un flux sans fin : seul le client y met un terme. `sse.closed`
  // arrête la boucle ; `onClose` est appelé quel que soit le bout
  // qui ferme. `maxDuration` borne un onglet oublié.
  @Get("/clock")
  async clock() {
    const sse = await this.renderSse({ maxDuration: 60_000 });
    let ticks = 0;
    sse.onClose(() => this.log(`horloge : client parti après ${ticks} tops`));
    while (!sse.closed) {
      ticks += 1;
      await sse.send({ tick: ticks, at: new Date().toISOString() });
      await sleep(TICK_MS);
    }
    return sse.close();
  }
  // #endregion

  // #region sse-negotiate
  // Même route, deux réponses : `acceptsSse()` lit l'en-tête
  // `Accept`. Un client ordinaire reçoit l'état en JSON ; qui
  // demande `text/event-stream` — EventSource le fait seul — le
  // suit en flux.
  @Get("/status")
  async status() {
    if (!this.acceptsSse()) return { state: "en cours", queue: 3 };
    const sse = await this.renderSse();
    for (let queue = 3; queue >= 0; queue -= 1) {
      const state = queue === 0 ? "fini" : "en cours";
      await sse.send({ state, queue }, { event: "status" });
      await sleep(STEP_MS);
    }
    return sse.close();
  }
  // #endregion

  // #region sse-post
  // Un flux en réponse à un `POST` : le corps est validé avant
  // l'action, puis la réponse s'écrit mot à mot, comme celle
  // d'un modèle de langage. `EventSource` ne sait faire que
  // `GET` : la page lit avec `NodefonySse`.
  @Post("/answer", { schema: { body: AskBody } })
  async answer(input: RouteInput<{ body: typeof AskBody }>) {
    const sse = await this.renderSse();
    for (const word of answerWords(input.body.question)) {
      if (sse.closed) break;
      await sse.send(word, { event: "token" });
      await sleep(WORD_MS);
    }
    await sse.send("fin", { event: "done" });
    return sse.close();
  }
  // #endregion
}

export default SseController;
