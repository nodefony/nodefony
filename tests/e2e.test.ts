import {
  ADMIN_PASSWORD,
  appBaseUrl,
  isExternalTarget,
  isTlsTarget,
} from "./e2e.setup";
import { AUTH_LOGIN_PATH } from "nodefony";
import { describe, it, expect, beforeAll } from "vitest";

/**
 * Test E2E — parle en HTTP à l'application RÉELLE (mode production).
 *
 * Seule porte d'entrée : `npm run test:e2e` (build d'abord : un serveur spawné
 * valide le DIST, pas le source). Ce fichier est EXCLU de `vitest.config.ts` et
 * ciblé par `vitest.e2e.config.ts` — invoqué, il tourne TOUJOURS : pas de gate
 * d'environnement qui l'afficherait « skipped » dans un rapport vert.
 *
 * Le démarrage et l'arrêt de l'application vivent dans `tests/e2e.setup.ts`
 * (une fois pour toute la suite), pas ici.
 *
 * Le port n'est PAS écrit en dur : le serveur publie ses ports effectifs
 * (`runningAppPort`) — un test qui suppose 5151 casse dès que l'app déclare son
 * port (`NF_PORT`, `PORT` en PaaS) ou qu'un port occupé l'a fait glisser en dev.
 */
let BASE = "http://127.0.0.1:5151";

describe("e2e — l'app boote et répond", () => {
  beforeAll(() => {
    // Le serveur est PRÊT (le setup global n'est sorti qu'après la readiness) :
    // ses ports sont publiés. Le premier est celui du serveur en clair (une app
    // TLS-only adaptera ces deux lignes).
    // Une seule règle d'adresse, portée par le décor (`appBaseUrl`) : la
    // recomposer ici ferait interroger le serveur local pendant qu'on croit
    // mesurer le déploiement visé.
    BASE = appBaseUrl();
  });

  it("GET / → 200, la page de l'application", async () => {
    const res = await fetch(`${BASE}/`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type") ?? "").toMatch(/text\/html/u);
  });

  it("probe cloud-native /livez → 200 (celle qu'interroge k8s)", async () => {
    const res = await fetch(`${BASE}/livez`);
    expect(res.status).toBe(200);
  });

  // `/api` est FERMÉ par défaut (zone `main` sans `anonymous`) : toute route
  // que tu y écris naît protégée — l'e2e de la première entité générée le
  // prouve (`GET` anonyme → 401). Ici, aucune route n'existe encore sous
  // `/api`, et le routeur passe AVANT le pare-feu : un chemin inconnu répond
  // 404, session ou pas. Ce n'est pas un trou — rien n'est servi — et un 401
  // ici ne prouverait rien de plus.
  it("/api sans route : 404 avant le pare-feu, même sans session", async () => {
    const res = await fetch(`${BASE}/api/route-pas-encore-ecrite`);
    expect(res.status).toBe(404);
  });

  // Un saut MUET se lit comme un vert : la raison s'affiche, comme le fait la
  // suite des migrations quand la cible devient externe.
  if (isExternalTarget && !isTlsTarget) {
    process.stdout.write(
      `cookie \`__Host-\` : SAUTÉ — la cible externe (${appBaseUrl()}) est servie ` +
        "en CLAIR, il n'y a donc aucun frontal TLS à croire.\n",
    );
  }

  // ── Derrière un frontal TLS SEULEMENT ──────────────────────────────────────
  // Ce que ce cas éprouve n'existe pas en direct : il faut un proxy qui termine
  // le TLS et annonce `X-Forwarded-Proto`, et un serveur qui le CROIT
  // (`trustProxy`). Sauté sinon — sauter ici est juste ; le taire ne le serait pas.
  //
  // 🔴 La condition porte sur le TLS, pas sur « externe » : une application
  // jointe par son nom de service (compose, cluster) est externe ET servie en
  // clair. Y exiger `__Host-` faisait échouer un serveur parfaitement correct —
  // le préfixe DÉRIVE du schéma constaté, et en clair il doit être absent.
  it.skipIf(!isTlsTarget)(
    "derrière le frontal : le cookie de session porte `__Host-`, donc le scheme du CLIENT",
    async () => {
      // 🔴 LE piège de la mise derrière un proxy, et il ne se voit pas en direct :
      // le serveur parle en CLAIR au frontal. S'il en déduisait le scheme, il se
      // croirait en http alors que le navigateur est en https — et le préfixe
      // `__Host-` (RFC 6265bis §4.1.3, anti session-fixation cross-subdomain)
      // serait omis SANS UN MOT. C'est `X-Forwarded-Proto`, cru parce que le
      // socket vient d'un pair de confiance (`trustProxy`), qui rétablit la
      // vérité.
      //
      // Pourquoi le préfixe et non l'attribut `Secure` : `Secure` vaut `true`
      // par défaut en configuration, il est donc posé MÊME quand le serveur se
      // croit en clair — un cas bâti dessus resterait vert sans `trustProxy` et
      // ne prouverait rien (mesuré). Le préfixe, lui, se DÉRIVE du scheme
      // constaté : il tombe dès que la confiance au proxy est retirée.
      const res = await fetch(`${appBaseUrl()}${AUTH_LOGIN_PATH}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          // La constante du DÉCOR, pas `process.env` : c'est elle que le
          // décor pose sur le serveur (`NF_ADMIN_PASSWORD`), et le serveur
          // tourne AILLEURS — dans un conteneur, ou sur une autre machine.
          // Lire l'environnement du RUNNER rendait la chaîne vide, donc un
          // `401` que ce cas imputait au cookie qu'il mesure. Une seule
          // source pour l'identité, et elle vit dans `e2e.setup`.
          password: ADMIN_PASSWORD,
        }),
      });
      expect(res.status).toBe(200);
      const cookies = res.headers.getSetCookie?.() ?? [];
      expect(cookies.length).toBeGreaterThan(0);
      const session =
        cookies.find((c) => /^(__Host-)?nodefony=/u.test(c)) ?? cookies[0];
      expect(session).toMatch(/^__Host-/u);
      expect(session).toMatch(/;\s*Secure/iu);
    },
  );
});
