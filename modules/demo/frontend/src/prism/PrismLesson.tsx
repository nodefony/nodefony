import type { IDemoAbout } from "../about";
import { docsVersion, docUrl } from "../about";
import { GamePage } from "../game/GamePage";
import { PrismGame } from "./PrismGame";
import { PRISM_HZ, prismTiles, ROUND_SECONDS } from "./prismDemo";
import { PRISM_LESSON } from "./prismTabs";

/**
 * Page « Prisme » (`/demo/prism`) : le jeu en tête, puis comment il marche et
 * son code. Mise en page commune aux jeux : `game/GamePage.tsx`.
 *
 * Guide pour un agent : le contrôleur est `PrismController.ts`, les règles
 * `PrismService.ts` sur la salle commune `game/GameRoom.ts` ; l'écran
 * `PrismGame.tsx`, la scène 3D `prismScene.ts` (Three.js, chargée à la demande).
 */
export function PrismLesson({ about }: { about: IDemoAbout | null }) {
  const version = docsVersion(about);
  return (
    <GamePage
      crumb="Prisme"
      title="Prisme : colore l'arène aux couleurs de ton équipe"
      intro={
        <>
          Pilote ton drone : chaque case survolée prend la couleur de ton
          équipe. Au bout de {ROUND_SECONDS} secondes, l'équipe qui tient le
          plus de cases gagne. Le serveur arbitre {PRISM_HZ} fois par seconde
          les {prismTiles.length} cases et les huit drones.
        </>
      }
      stage={<PrismGame />}
      how={[
        {
          title: "Le serveur fait foi",
          text: "La page envoie une direction, jamais une position. Le serveur déplace le drone et décide à qui appartient chaque case.",
        },
        {
          title: "Un octet par case",
          text: "La grille se calcule des deux côtés par la même fonction ; la trame ne porte que le propriétaire de chaque case, et 8 octets par drone.",
        },
        {
          title: "La 3D à la demande",
          text: "Three.js n'est chargé que sur cette page, après la socket : 397 prismes en un seul appel de dessin.",
        },
        {
          title: "La même salle que Météores",
          text: "Pilotes, robots, boucle, publication, interpolation, fil mesuré : les mêmes briques. Prisme n'écrit que ses règles et sa scène.",
        },
      ]}
      lesson={PRISM_LESSON}
      version={version}
      traps={[
        {
          title:
            "Publier la grille vivante, c'est publier un état qui bouge encore.",
          text: "La trame en porte une copie : l'encodage peut se faire après le tour suivant.",
        },
        {
          title:
            "Importer Three.js en tête de fichier le fait payer à toute la démo.",
          text: (
            <>
              Seul un <code>import()</code> différé le cantonne à cette page ;
              un <code>import type</code> ne charge rien.
            </>
          ),
        },
        {
          title: "Retoucher les 397 cases à chaque image sature le GPU.",
          text: "La scène ne met à jour que les cases dont le propriétaire a changé, ou qui montent encore.",
        },
      ]}
      further={[
        {
          href: docUrl(version, "modules/realtime/cas-d-usage"),
          label: "Un jeu, et les autres cas d'usage — @nodefony/realtime",
        },
        {
          href: "/demo/meteor",
          label: "Météores : la même salle, un autre jeu",
        },
        {
          href: "/demo/binary",
          label: "Temps réel binaire : des octets sur la socket",
        },
      ]}
    />
  );
}
