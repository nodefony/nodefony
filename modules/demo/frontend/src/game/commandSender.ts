/**
 * Envoyer les commandes d'un joueur sans noyer le serveur : la brique de la page
 * que les jeux de la démo partagent.
 *
 * Guide pour un agent : la souris bouge 120 fois par seconde, le serveur joue
 * 30 tours. La page n'envoie donc une commande que si elle a CHANGÉ, au plus une
 * par intervalle (la dernière n'est jamais perdue : elle part à la fin de
 * l'intervalle), et un signe de vie quand rien ne bouge — sans lui, le serveur
 * libère la place d'un joueur immobile (`IDLE_MS` de `GameRoom`).
 */

/** Ce que rend `createCommandSender`. */
export interface ICommandSender<T> {
  /** La commande voulue maintenant ; elle part dès que l'intervalle le permet. */
  update(command: T): void;
  /** Commandes réellement envoyées depuis la création. */
  readonly sent: number;
  /** Arrête les minuteries ; plus rien ne part. */
  dispose(): void;
}

// #region game-command-sender
/**
 * @param send - pose la commande sur la socket
 * @param same - deux commandes identiques ne partent pas deux fois
 * @param intervalMs - au plus une commande par intervalle
 * @param keepAliveMs - signe de vie quand rien ne change
 */
export function createCommandSender<T>(
  send: (command: T) => void,
  same: (a: T, b: T) => boolean,
  intervalMs = 33,
  keepAliveMs = 2000,
): ICommandSender<T> {
  let wanted: T | null = null;
  let last: T | null = null;
  let lastAt = 0;
  let sent = 0;
  let pending: ReturnType<typeof setTimeout> | null = null;
  const flush = () => {
    pending = null;
    if (wanted === null) return;
    last = wanted;
    lastAt = performance.now();
    sent += 1;
    send(wanted);
  };
  const alive = setInterval(() => {
    if (last !== null && performance.now() - lastAt >= keepAliveMs) flush();
  }, keepAliveMs / 2);
  return {
    update(command) {
      wanted = command;
      if (last !== null && same(last, command)) return;
      if (pending !== null) return;
      const wait = intervalMs - (performance.now() - lastAt);
      if (wait <= 0) flush();
      else pending = setTimeout(flush, wait);
    },
    get sent() {
      return sent;
    },
    dispose() {
      clearInterval(alive);
      if (pending !== null) clearTimeout(pending);
      pending = null;
    },
  };
}
// #endregion
