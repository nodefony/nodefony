import path from "node:path";
import { Readable } from "node:stream";
import { setTimeout as sleep } from "node:timers/promises";
import {
  controller,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseSession,
} from "@nodefony/framework";
import type { RouteInput } from "@nodefony/framework";
import { HttpError } from "@nodefony/http";
import type { ContextType } from "@nodefony/http";
import {
  BOOKS,
  COUNTDOWN_FROM,
  COUNTDOWN_STEP_MS,
  EchoBody,
  FIRST_PATH,
  type IHello,
} from "../../frontend/src/first/firstSteps";

/**
 * Premiers pas — un contrôleur, et les dix gestes qu'on fait avec : rendre une
 * valeur, du HTML, lire un corps validé, lever une erreur, rediriger, renvoyer
 * une `Response` Web, un flux, un fichier, savoir qui appelle, et répondre par
 * WebSocket avec la même action.
 *
 * Guide pour un agent : la règle d'or est « retourne une valeur, le framework
 * la rend » ; les `render*` ne servent que pour piloter l'envoi (statut,
 * en-têtes, flux, fichier). Le contrôleur est un SINGLETON : rien ne se garde
 * sur `this`. Doc : `@nodefony/framework/docs/controller.md` ; générer
 * l'équivalent : `npx nodefony create controller`.
 *
 * Les blocs `// #region <nom>` sont CITÉS par la page d'apprentissage
 * (`frontend/src/first/FirstStepsLesson.tsx`) : les renommer casse son test.
 */
// #region first-class
// Toutes les routes de la classe commencent par FIRST_PATH.
@controller(FIRST_PATH)
class FirstStepsController extends Controller {
  // Le nom passé à `super()` est celui du service, dans les
  // journaux.
  constructor(context: ContextType) {
    super("first-steps", context);
  }
  // #endregion

  // #region first-hello
  // `return` d'un objet : le framework le rend en JSON, sans
  // `send()`. `{name}` dans le chemin arrive par `@Param`,
  // `?lang=` par `@Query`. Geste 10 : `WEBSOCKET` ajouté, la MÊME
  // action répond aussi à une socket.
  @Get("/hello/{name}", { requirements: { methods: ["WEBSOCKET"] } })
  hello(@Param("name") name: string, @Query("lang") lang?: string): IHello {
    const english = lang === "en";
    return {
      message: `${english ? "Hello" : "Bonjour"} ${name} !`,
      lang: english ? "en" : "fr",
      transport: this.method === "WEBSOCKET" ? "websocket" : "http",
    };
  }
  // #endregion

  // #region first-render
  // Du HTML : on dit le type, puis `render()` envoie la chaîne.
  @Get("/page")
  page() {
    this.setContextHtml();
    return this.render(
      '<!doctype html><html lang="fr"><title>Bonjour</title>' +
        "<h1>Bonjour</h1><p>Rendu par <code>render()</code>.</p></html>",
    );
  }

  // Du texte brut : le type passe en en-tête, avec le statut.
  @Get("/text")
  text() {
    return this.render("Bonjour, en texte brut.", "utf8", 200, {
      "Content-Type": "text/plain; charset=utf-8",
    });
  }
  // #endregion

  // #region first-echo
  // Le corps est VALIDÉ avant l'action, avec le schéma que la page
  // partage : un âge manquant ou du texte à la place d'un nombre
  // rend 422, sans entrer ici.
  @Post("/echo", { schema: { body: EchoBody } })
  echo(input: RouteInput<{ body: typeof EchoBody }>) {
    return { received: input.body, adult: input.body.age >= 18 };
  }
  // #endregion

  // #region first-errors
  // Une erreur levée devient une réponse : 404 en JSON, jamais de
  // pile en production. Le statut est le second argument.
  @Get("/books/{id}")
  book(@Param("id") id: string) {
    const found = BOOKS.find((book) => String(book.id) === id);
    if (found === undefined) {
      throw new HttpError(`livre ${id} introuvable`, 404);
    }
    return found;
  }
  // #endregion

  // #region first-redirect
  // Une ancienne adresse renvoie vers la nouvelle. 302 par défaut
  // : un 301 est gardé par le navigateur presque pour toujours.
  @Get("/old-hello")
  oldHello() {
    this.redirect(`${FIRST_PATH}/hello/visiteur`);
  }
  // #endregion

  // #region first-flash
  // Envoyer, puis rediriger (303) : recharger la page d'arrivée ne
  // renvoie pas le formulaire. Le message flash vit en session, et
  // se lit UNE fois.
  @Post("/note")
  @UseSession()
  note() {
    this.addFlash("note", "Note enregistrée.");
    this.redirect(`${FIRST_PATH}/note`, 303);
  }

  @Get("/note")
  @UseSession()
  readNote() {
    return { flash: this.getFlashBag("note") ?? null };
  }
  // #endregion

  // #region first-web-response
  // La `Response` standard, celle de `fetch()` : renvoyée telle
  // quelle, son statut, ses en-têtes et son corps partent en flux.
  @Get("/web")
  web() {
    return Response.json(
      { from: "new Response()", standard: "Fetch API" },
      { status: 200, headers: { "x-demo": "response-web" } },
    );
  }
  // #endregion

  // #region first-stream
  // Un flux : chaque morceau part dès qu'il est prêt, la page le
  // lit en direct. Le client s'en va ? Le flux est coupé, le
  // générateur s'arrête.
  @Get("/countdown")
  countdown() {
    async function* lines(): AsyncGenerator<string> {
      for (let n = COUNTDOWN_FROM; n > 0; n -= 1) {
        yield `${n}…\n`;
        await sleep(COUNTDOWN_STEP_MS);
      }
      yield "Décollage !\n";
    }
    return this.renderStream(Readable.from(lines(), { objectMode: false }), {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
  // #endregion

  // #region first-file
  // Un fichier du disque, en flux : ETag et Last-Modified sont
  // posés tout seuls, et un client qui a déjà la version reçoit
  // 304, sans corps. `?download` : le même fichier, en pièce à
  // enregistrer. Le type se dit : déduit de l'extension, `.ts`
  // serait une vidéo MPEG (`video/mp2t`).
  @Get("/source")
  async source(@Query("download") download?: string) {
    const file = path.join(
      this.module?.path ?? "",
      "nodefony",
      "controllers",
      "FirstStepsController.ts",
    );
    if (download !== undefined) {
      await this.renderFileDownload(file, undefined, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      return;
    }
    await this.streamFile(file, {
      "Content-Type": "text/plain; charset=utf-8",
    });
  }
  // #endregion

  // #region first-whoami
  // Qui appelle ? `this.user` : l'identité posée par le pare-feu,
  // ou `null` pour un visiteur. Jamais un champ envoyé par le
  // navigateur.
  @Get("/whoami")
  whoami() {
    const me = this.user;
    if (me === null) return { connected: false };
    return { connected: true, identifier: me.identifier, roles: me.roles };
  }
  // #endregion
}

export default FirstStepsController;
