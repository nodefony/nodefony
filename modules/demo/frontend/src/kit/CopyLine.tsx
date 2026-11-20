import { useState } from "react";

/**
 * Une commande à copier, et son bouton.
 *
 * Guide pour un agent : brique du KIT, partagée par les pages qui font taper
 * quelque chose dans un terminal (MCP, gRPC). Le presse-papiers peut être
 * refusé (page non sécurisée, permission) : la commande reste alors
 * sélectionnable à la main, rien ne casse.
 *
 * @param text - la commande, telle qu'elle se tape
 */
export function CopyLine({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="copy-line">
      <pre className="copy-text">{text}</pre>
      <button
        type="button"
        className="btn"
        onClick={() => {
          navigator.clipboard
            .writeText(text)
            .then(() => {
              setDone(true);
              setTimeout(() => setDone(false), 1500);
            })
            .catch(() => {
              // Presse-papiers refusé : la commande reste sélectionnable.
            });
        }}
      >
        {done ? "Copié" : "Copier"}
      </button>
    </div>
  );
}
