import { useEffect, useState } from "react";
import { NodefonySocket } from "nodefony/client";
import { DEMO_REALTIME_PATH, type DemoContract } from "../pulse";
import { DEMO_MCP_CHANNEL, type IMcpFeedEntry } from "./mcpDemo";

/** Lignes gardées à l'écran : les plus récentes. */
export const MCP_FEED_KEPT = 12;

/** Une ligne du fil, et son rang d'arrivée sur cette page (la clé d'affichage). */
export interface IMcpFeedRow extends IMcpFeedEntry {
  seq: number;
}

// #region client-feed
/**
 * Le fil en direct de la porte MCP, tant que la page est AFFICHÉE : chaque
 * appel reçu par `/mcp/demo` — celui de la page comme celui d'un agent
 * branché ailleurs —, sans ses arguments.
 *
 * Guide pour un agent : la socket de la démo (`/demo/realtime`), typée par
 * son contrat (`DemoContract`, `pulse.ts`). S'abonner est ce qui ALLUME la
 * diffusion côté serveur ; un onglet caché se désabonne, et le serveur ne
 * bâtit plus aucune ligne.
 *
 * @returns les dernières lignes, la plus récente en tête
 */
export function useMcpFeed(): readonly IMcpFeedRow[] {
  const [feed, setFeed] = useState<readonly IMcpFeedRow[]>([]);
  useEffect(() => {
    const socket = NodefonySocket.fromContract<DemoContract>({
      url: DEMO_REALTIME_PATH,
    });
    let watching = false;
    let seq = 0;
    const follow = () => {
      const visible = document.visibilityState === "visible";
      if (visible && !watching) {
        watching = true;
        socket.subscribe(DEMO_MCP_CHANNEL);
      } else if (!visible && watching) {
        watching = false;
        socket.unsubscribe(DEMO_MCP_CHANNEL);
      }
    };
    const off = socket.on(DEMO_MCP_CHANNEL, (entry) => {
      seq += 1;
      const row = { ...entry, seq };
      setFeed((before) => [row, ...before].slice(0, MCP_FEED_KEPT));
    });
    document.addEventListener("visibilitychange", follow);
    follow();
    socket.connect().catch(() => {
      // Serveur injoignable : le fil reste vide, la reconnexion continue.
    });
    return () => {
      document.removeEventListener("visibilitychange", follow);
      off();
      socket.disconnect();
    };
  }, []);
  return feed;
}
// #endregion
