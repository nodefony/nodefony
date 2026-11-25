import type { IProbeChunk, IProbeResult } from "./probe";

/**
 * La requête telle que partie — avec les en-têtes qui changent la réponse
 * (`Range`, `If-Range`…) — et la réponse telle que reçue : statut, durée,
 * en-têtes utiles, redirection suivie, puis le corps — ou, pendant un flux,
 * les morceaux au fil de leur arrivée. Un corps binaire est montré en
 * hexadécimal.
 *
 * Guide pour un agent : brique du KIT ; les données viennent de `probe.ts`.
 * `live` affiche les morceaux d'un flux encore ouvert.
 *
 * @param result - le résultat final, `null` tant que l'appel court
 * @param live - les morceaux déjà reçus d'un appel en cours
 */
export function ProbeResult({
  result,
  live = null,
}: {
  result: IProbeResult | null;
  live?: readonly IProbeChunk[] | null;
}) {
  if (result === null) {
    if (live === null || live.length === 0) return null;
    return (
      <div className="trial-result">
        <p className="trial-line">
          <span className="status pending">en cours…</span>
        </p>
        <Chunks chunks={live} />
      </div>
    );
  }
  const tone =
    result.status === null ? "ko" : result.status < 400 ? "ok" : "ko";
  return (
    <div className="trial-result">
      <p className="trial-line">
        <span className={`status ${tone}`}>
          {result.status ?? result.error ?? "échec"}
        </span>
        <code>{result.request}</code>
        <span className="probe-ms">{result.ms} ms</span>
      </p>
      {result.sent.length > 0 && (
        <dl className="trial-headers probe-sent" aria-label="En-têtes envoyés">
          {result.sent.map(([name, value]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>
                <code>{value}</code>
              </dd>
            </div>
          ))}
        </dl>
      )}
      {result.finalUrl !== null && (
        <p className="probe-redirect">
          Redirection suivie par le navigateur, arrivée sur{" "}
          <code>{result.finalUrl}</code>
        </p>
      )}
      {result.headers.length > 0 && (
        <dl className="trial-headers">
          {result.headers.map(([name, value]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>
                <code>{value}</code>
              </dd>
            </div>
          ))}
        </dl>
      )}
      {result.chunks.length > 1 ? (
        <Chunks chunks={result.chunks} />
      ) : (
        <pre>
          <code>{result.body === "" ? "(corps vide)" : result.body}</code>
        </pre>
      )}
    </div>
  );
}

/** Les morceaux d'un flux, chacun avec son instant d'arrivée. */
function Chunks({ chunks }: { chunks: readonly IProbeChunk[] }) {
  // Les morceaux ne font que s'ajouter : leur rang est leur identité. Deux
  // trames identiques peuvent arriver dans la même milliseconde.
  const ranked = chunks.map((chunk, rank) => ({ ...chunk, rank }));
  return (
    <ol className="probe-chunks" aria-label="Morceaux reçus">
      {ranked.map((chunk) => (
        <li key={chunk.rank}>
          <span className="probe-at">+{chunk.at} ms</span>
          <code>{chunk.text.trimEnd()}</code>
        </li>
      ))}
    </ol>
  );
}
