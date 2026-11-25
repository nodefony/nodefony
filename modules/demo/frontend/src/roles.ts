import type { DemoId } from "../../demos";

/**
 * Les cinq parcours de « Selon qui tu es » — ceux de la page « Par où
 * commencer » de la documentation (`docs/demarrer.md`).
 *
 * Les métiers qui ne développent pas mènent à LEUR doc ; les développeurs,
 * aux démos dans l'ordre. Une démo se cite par son `DemoId` : elle vient de
 * l'index `demos.ts`, et un identifiant qui n'y est pas ne compile pas.
 */

/** Une page de doc d'un parcours : sous `docs/` du site, ou un fichier du dépôt. */
export interface IRoleDocLink {
  title: string;
  description: string;
  /** Chemin de la page sous `docs/` (`guides/kubernetes`). */
  page?: string;
  /** Fichier à la racine du dépôt (`SECURITY.md`), quand la page n'est pas sur le site. */
  repoFile?: string;
}

/** Une étape d'un parcours de développeur. */
export interface IRoleDemoStep {
  demo: DemoId;
  /** Ce que l'étape apprend À CE MÉTIER — la même démo ne dit pas la même chose au front et au back. */
  description: string;
}

interface IRoleBase {
  id: string;
  label: string;
  /** Ce que ce métier cherche, en une phrase. */
  summary: string;
}

/** Un parcours : de la doc, ou des démos dans l'ordre. */
export type Role =
  | (IRoleBase & { kind: "doc"; links: readonly IRoleDocLink[] })
  | (IRoleBase & { kind: "demo"; steps: readonly IRoleDemoStep[] });

/** Page de la doc qui porte les cinq parcours en entier. */
export const ROLES_DOC_PAGE = "demarrer";

export const ROLES = [
  {
    id: "dt",
    label: "Directeur technique",
    summary:
      "Ce que tu évalues, c'est la reprise : une équipe peut-elle maintenir ce code seule ?",
    kind: "doc",
    links: [
      {
        title: "Licence Apache 2.0",
        description: "Le code se reprend, se modifie et se redistribue.",
        repoFile: "LICENSE.txt",
      },
      {
        title: "Compatibilité et support",
        description: "Ce que la garantie couvre, et la règle de support.",
        page: "guides/compatibilite",
      },
      {
        title: "Monter de version",
        description:
          "Les paquets montent ensemble ; ce qu'un install ne refait pas.",
        page: "guides/montee-de-version",
      },
      {
        title: "Politique de sécurité",
        description: "Comment signaler une faille, et des délais dits.",
        repoFile: "SECURITY.md",
      },
    ],
  },
  {
    id: "ops",
    label: "DevOps",
    summary:
      "Un process = un conteneur ; le reste se délègue à l'orchestrateur.",
    kind: "doc",
    links: [
      {
        title: "Docker & cloud-native",
        description: "Un process = un conteneur, scaling délégué.",
        page: "guides/docker-cloud-native",
      },
      {
        title: "Kubernetes",
        description:
          "Manifestes, identité du pod, migrations avant les exemplaires.",
        page: "guides/kubernetes",
      },
      {
        title: "Reverse-proxy",
        description: "nginx, HAProxy, Traefik : une config dérivée de l'app.",
        page: "guides/reverse-proxy",
      },
      {
        title: "En-têtes de sécurité",
        description: "CSP, HSTS, COOP/COEP : ce que le navigateur applique.",
        page: "modules/security/headers",
      },
    ],
  },
  {
    id: "arch",
    label: "Architecte",
    summary:
      "Comprendre l'ossature avant de juger les choix ; chaque page suppose la précédente.",
    kind: "doc",
    links: [
      {
        title: "Vue d'ensemble",
        description:
          "Ce qu'est le framework, et ce que ses partis pris coûtent.",
        page: "architecture/vue-ensemble",
      },
      {
        title: "Injection & portées",
        description: "Un calque par requête sur le conteneur de l'application.",
        page: "architecture/injection-portees",
      },
      {
        title: "Cycle de boot du Kernel",
        description: "Entre le lancement et le premier octet servi.",
        page: "architecture/cycle-boot-kernel",
      },
      {
        title: "Pipeline de requête",
        description: "Le trajet exact d'une requête, HTTP comme WebSocket.",
        page: "architecture/pipeline-requete",
      },
    ],
  },
  {
    id: "front",
    label: "Développeur front",
    summary:
      "Deux serveurs en développement, un seul en production ; le navigateur n'en voit qu'un.",
    kind: "demo",
    steps: [
      { demo: "first-steps", description: "Une action, deux transports." },
      {
        demo: "chat",
        description: "Les hooks de nodefony/react sur une vraie socket.",
      },
      { demo: "sse", description: "EventSource côté navigateur." },
      { demo: "binary", description: "Des trames CBOR typées des deux côtés." },
    ],
  },
  {
    id: "back",
    label: "Développeur back",
    summary:
      "Construire, persister, sécuriser : chaque étage suppose le précédent.",
    kind: "demo",
    steps: [
      { demo: "first-steps", description: "Contrôleur, route, réponse." },
      { demo: "chat", description: "Historique en base, salon protégé." },
      {
        demo: "partner",
        description: "Une zone du firewall réservée aux jetons machine.",
      },
      { demo: "grpc", description: "Un service dans le pipeline HTTP/2." },
    ],
  },
] as const satisfies readonly Role[];

/** Identifiant d'un parcours. */
export type RoleId = (typeof ROLES)[number]["id"];
