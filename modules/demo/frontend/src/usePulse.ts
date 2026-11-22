import { useEffect, useState } from "react";
import { NodefonySocket } from "nodefony/client";
import {
  DEMO_PULSE_CHANNEL,
  DEMO_PULSE_NOW,
  DEMO_REALTIME_PATH,
  type DemoContract,
  type IDemoPulse,
} from "./pulse";

/**
 * Le pouls de la démo, tant que la page est AFFICHÉE.
 *
 * Guide pour un agent : la socket est typée par le contrat partagé
 * (`fromContract<DemoContract>`) — le nom du canal, la méthode et leurs
 * charges viennent de `pulse.ts`. L'abonnement suit la visibilité de l'onglet :
 * un onglet caché se désabonne, et le serveur, sans spectateur, ne publie plus
 * rien. À l'ouverture comme au retour, la méthode `demo:pulse:now` rend l'état
 * courant ; le canal ne porte ensuite que les changements.
 *
 * @returns le dernier pouls reçu, ou `null` tant que rien n'est arrivé
 */
export function usePulse(): IDemoPulse | null {
  const [pulse, setPulse] = useState<IDemoPulse | null>(null);
  useEffect(() => {
    const socket = NodefonySocket.fromContract<DemoContract>({
      url: DEMO_REALTIME_PATH,
    });
    let watching = false;
    const refresh = () => {
      if (socket.state !== "connected") return;
      socket
        .request(DEMO_PULSE_NOW, {})
        .then(setPulse)
        .catch(() => {
          // Socket tombée entre-temps : la reconnexion redemande l'état.
        });
    };
    const follow = () => {
      const visible = document.visibilityState === "visible";
      if (visible && !watching) {
        watching = true;
        socket.subscribe(DEMO_PULSE_CHANNEL);
        refresh();
      } else if (!visible && watching) {
        watching = false;
        socket.unsubscribe(DEMO_PULSE_CHANNEL);
      }
    };
    const offPulse = socket.on(DEMO_PULSE_CHANNEL, setPulse);
    const offState = socket.onState((state) => {
      if (state === "connected" && watching) refresh();
    });
    document.addEventListener("visibilitychange", follow);
    follow();
    socket.connect().catch(() => {
      // Serveur injoignable : les cartes restent sans état, et la
      // reconnexion continue en fond.
    });
    return () => {
      document.removeEventListener("visibilitychange", follow);
      offPulse();
      offState();
      socket.disconnect();
    };
  }, []);
  return pulse;
}
