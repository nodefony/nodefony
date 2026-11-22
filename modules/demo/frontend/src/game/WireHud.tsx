import { useEffect, useState } from "react";
import { formatBytes } from "../binary/wire";
import type { IWireStats } from "./wireMeter";

/**
 * Le fil, en surimpression sur un jeu : la brique d'écran que les jeux de la
 * démo partagent.
 *
 * Guide pour un agent : le panneau relit le compteur une fois par seconde (pas
 * à chaque image : un nombre qui change 60 fois par seconde ne se lit pas). Le
 * jeu y ajoute ses propres lignes (`extra`) : météores, cases, retard de
 * boucle du serveur…
 */

/** Une ligne propre au jeu. */
export interface IHudRow {
  label: string;
  value: string;
}

/** Le panneau du fil : ce que la socket a porté pendant la dernière seconde. */
export function WireHud({
  read,
  extra,
}: {
  read: () => IWireStats | null;
  extra: () => readonly IHudRow[];
}) {
  const [stats, setStats] = useState<IWireStats | null>(null);
  const [rows, setRows] = useState<readonly IHudRow[]>([]);
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(read());
      setRows(extra());
    }, 1000);
    return () => clearInterval(timer);
  }, [read, extra]);
  const lines: IHudRow[] = [
    {
      label: "format",
      value:
        stats?.binary === null || stats === null
          ? "…"
          : stats.binary
            ? "CBOR binaire"
            : "texte",
    },
    { label: "trames reçues/s", value: String(stats?.framesIn ?? "…") },
    {
      label: "taille d'une trame",
      value: stats === null ? "…" : formatBytes(stats.lastFrame),
    },
    {
      label: "débit reçu",
      value: stats === null ? "…" : `${formatBytes(stats.bytesIn)}/s`,
    },
    { label: "commandes envoyées/s", value: String(stats?.framesOut ?? "…") },
    ...rows,
  ];
  return (
    <aside className="game-hud" aria-label="Le fil, mesuré sur la socket">
      <h2>Le fil</h2>
      <dl>
        {lines.map((line) => (
          <div key={line.label}>
            <dt>{line.label}</dt>
            <dd>{line.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
