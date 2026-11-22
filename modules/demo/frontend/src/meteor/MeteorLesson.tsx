import type { IDemoAbout } from "../about";
import { docsVersion, docUrl } from "../about";
import { GamePage } from "../game/GamePage";
import { MeteorGame } from "./MeteorGame";
import { METEOR_HZ } from "./meteorDemo";
import { METEOR_LESSON } from "./meteorTabs";

/**
 * Page « Météores » (`/demo/meteor`) : le jeu en tête, puis comment il marche
 * et son code. Mise en page commune aux jeux : `game/GamePage.tsx`.
 *
 * Guide pour un agent : le contrôleur est `MeteorController.ts`, les règles
 * `MeteorService.ts` sur la salle commune `game/GameRoom.ts` ; l'écran
 * `MeteorGame.tsx`, le dessin `meteorScene.ts`.
 */
export function MeteorLesson({ about }: { about: IDemoAbout | null }) {
  const version = docsVersion(about);
  return (
    <GamePage
      crumb="Météores"
      title="Météores : défendez la planète ensemble"
      intro={
        <>
          Vise avec la souris, clique pour tirer. Ouvre un deuxième onglet : un
          second canon apparaît sur l'anneau. Le serveur arbitre {METEOR_HZ}{" "}
          fois par seconde, et le fil mesuré s'affiche en direct.
        </>
      }
      stage={<MeteorGame />}
      how={[
        {
          title: "Le serveur fait foi",
          text: "La page envoie un angle et la gâchette, jamais « j'ai touché ». C'est le serveur qui déplace les tirs, voit le contact et casse le météore.",
        },
        {
          title: "Le monde en octets",
          text: "Chaque tour, l'état complet part en CBOR : 8 octets par météore, 6 par tir. Une trame perdue ne désynchronise personne.",
        },
        {
          title: "Fluide à 60 images/s",
          text: "La page affiche l'instant d'il y a deux tours, entre deux trames connues. Les tirs vont tout droit : ils sont prolongés plutôt qu'attendus.",
        },
        {
          title: "Une salle commune",
          text: "Pilotes, robots, boucle et publication viennent de la même brique que Prisme. Météores n'écrit que ses règles et son dessin.",
        },
      ]}
      lesson={METEOR_LESSON}
      version={version}
      traps={[
        {
          title: "Une position venue de la page est un mensonge possible.",
          text: "Elle n'envoie qu'une intention (un angle), bornée et validée par le schéma du serveur.",
        },
        {
          title: "Un setInterval nu dérive.",
          text: (
            <>
              Chaque retard de la boucle d'événements décale les tours suivants
              : la boucle à pas fixe calcule l'heure du prochain sur{" "}
              <code>hrtime</code>.
            </>
          ),
        },
        {
          title: "Envoyer à chaque mouvement de souris noie le serveur.",
          text: "Une commande ne part que si elle a changé, au plus trente fois par seconde.",
        },
        {
          title: "Une explosion n'est pas un état.",
          text: "Elle part une seule fois, dans la trame du tour qui l'a vue ; la page la déclenche à l'arrivée.",
        },
      ]}
      further={[
        {
          href: docUrl(version, "modules/realtime/cas-d-usage"),
          label: "Un jeu, et les autres cas d'usage — @nodefony/realtime",
        },
        { href: "/demo/prism", label: "Prisme : la même salle, un autre jeu" },
        {
          href: "/demo/binary",
          label: "Temps réel binaire : des octets sur la socket",
        },
      ]}
    />
  );
}
