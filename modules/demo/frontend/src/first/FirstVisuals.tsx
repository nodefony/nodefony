import type { IProbeResult } from "../kit/probe";
import { describeExchange } from "./exchange";

/**
 * L'aller-retour d'un geste, en IMAGE : la page envoie (méthode, adresse,
 * en-têtes qui comptent), le serveur répond (statut, ce que porte le
 * corps), et une phrase dit ce que ça veut dire. Un corps arrivé en
 * plusieurs morceaux montre QUAND chacun est arrivé.
 *
 * Guide pour un agent : la lecture vit dans `exchange.ts` (pur) ; l'entrée
 * est le résultat de la sonde (`kit/probe.ts`).
 *
 * @param result - le dernier résultat du geste
 */
export function Exchange({ result }: { result: IProbeResult }) {
  const exchange = describeExchange(result);
  const [method = "", ...rest] = result.request.split(" ");
  const sent = result.sent.map(([name, value]) => `${name}: ${value}`);
  return (
    <figure className={`exchange tone-${exchange.tone}`}>
      <div className="exchange-row">
        <span className="exchange-end">Page</span>
        <span className="exchange-arrow is-out">
          <code>
            {method} {rest.join(" ")}
          </code>
          {sent.length > 0 && <small>{sent.join(" · ")}</small>}
        </span>
        <span className="exchange-end">Serveur</span>
      </div>
      <div className="exchange-row">
        <span className="exchange-end">Page</span>
        <span className="exchange-arrow is-back">
          <code>
            {exchange.status} · {exchange.body}
          </code>
        </span>
        <span className="exchange-end">Serveur</span>
      </div>
      {result.chunks.length > 1 && (
        <div
          className="exchange-chunks"
          role="img"
          aria-label={`${result.chunks.length} morceaux reçus en ${result.ms} ms`}
        >
          {result.chunks
            .map((chunk, rank) => ({ rank, at: chunk.at }))
            .map((tick) => (
              <span
                key={tick.rank}
                style={{ left: `${(tick.at / Math.max(result.ms, 1)) * 100}%` }}
              />
            ))}
        </div>
      )}
      <figcaption>{exchange.phrase}</figcaption>
    </figure>
  );
}
