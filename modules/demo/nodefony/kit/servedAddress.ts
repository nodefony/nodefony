import { isLoopbackHostname, readRuntimeState } from "nodefony";

/**
 * Les noms qu'un navigateur donne d'ordinaire à cette machine — une liste à
 * ÉNUMÉRER pour composer des origines. Savoir si un nom DÉSIGNE la boucle
 * locale est une autre question, tranchée par la règle du cœur
 * (`isLoopbackHostname`). Une page ouverte sur `https://127.0.0.1:5152` et une
 * autre sur `https://localhost:5152` visent le même serveur, mais ne
 * présentent pas la même origine.
 */
const LOOPBACK_NAMES: readonly string[] = ["localhost", "127.0.0.1", "[::1]"];

/**
 * L'origine où CETTE application écoute vraiment pour un schéma, telle que
 * son serveur l'a publiée une fois ses ports ouverts.
 *
 * Guide pour un agent : la config dit le port DEMANDÉ ; en développement, un
 * port déjà pris fait glisser le serveur au suivant (5152 → 5155), et seul
 * l'état d'exécution le sait (`nodefony status` le lit aussi). Une commande
 * qui vise l'application, ou une porte qui reconnaît ses propres pages, part
 * donc de là, jamais du port de la config ni de l'adresse écrite dans un jeton.
 *
 * @param root - la racine de l'application
 * @param scheme - `http` ou `https` : seul le serveur sait lequel de ses ports parle TLS
 * @returns l'origine servie, ou `null` quand aucun serveur de cette application ne tourne
 */
export function servedOrigin(
  root: string,
  scheme: "http" | "https",
): string | null {
  const url = readRuntimeState(root)?.urls?.find((u) =>
    u.startsWith(`${scheme}:`),
  );
  return url === undefined ? null : new URL(url).origin;
}

/**
 * Les origines par lesquelles une page de CETTE application peut se présenter :
 * chaque adresse servie, sous chacun des noms de la boucle locale.
 *
 * Ce n'est pas une comparaison avec l'en-tête `Host` : une page étrangère qui
 * fait pointer son propre nom sur cette machine (DNS rebinding) présente un
 * `Host` et une `Origin` qui concordent. Seuls les ports réellement servis,
 * sous un nom local, désignent l'application.
 *
 * @param root - la racine de l'application
 * @returns les origines admises, vide quand aucun serveur ne tourne
 */
export function servedBrowserOrigins(root: string): string[] {
  const origins = new Set<string>();
  for (const raw of readRuntimeState(root)?.urls ?? []) {
    const url = new URL(raw);
    // L'origine publiée d'abord, telle quelle — `127.0.0.2` désigne la boucle
    // locale sans figurer parmi les noms à énumérer.
    origins.add(url.origin);
    if (!isLoopbackHostname(url.hostname)) continue;
    // Un port par défaut du schéma (443, 80) disparaît de l'URL normalisée.
    const port = url.port === "" ? "" : `:${url.port}`;
    for (const name of LOOPBACK_NAMES) {
      origins.add(`${url.protocol}//${name}${port}`);
    }
  }
  return [...origins];
}
