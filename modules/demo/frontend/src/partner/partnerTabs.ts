import type { ILesson, LessonFile } from "../lesson/lesson";

/**
 * L'API entre programmes, couche par couche — le code CITÉ des vrais fichiers
 * du module (modèle commun : `lesson/lesson.ts`).
 *
 * Doc : `@nodefony/security/docs/obtenir-un-jeton.md`.
 */

const API: LessonFile = "nodefony/controllers/PartnerController.ts";
const DESK: LessonFile = "nodefony/controllers/PartnerTokenController.ts";
const ISSUER: LessonFile = "nodefony/service/PartnerTokenService.ts";
const COMMAND: LessonFile = "nodefony/command/PartnerCallCommand.ts";

export const PARTNER_LESSON = {
  tabs: [
    {
      layer: "config",
      blocks: [
        {
          text: "Un seul réglage propre à la démo : le secret du client machine Keycloak. Il se déclare dans le schéma de la config du module, avec son NOM COURT de déploiement (`NF_KEYCLOAK_MACHINE_SECRET`) — aucune variable d'environnement n'est lue ailleurs, et `npx nodefony env` le montre.",
          excerpt: {
            file: "nodefony/config/config.ts",
            region: "partner-config",
          },
        },
        {
          text: "La zone de l'API rejoint le firewall de l'application par la clé `module-security` : retirer la démo la retire.",
          excerpt: {
            file: "nodefony/config/config.ts",
            region: "demo-module-security",
          },
        },
      ],
    },
    {
      layer: "security",
      blocks: [
        {
          text: "Le firewall de `@nodefony/security` découpe l'application en zones (`areas`). La zone `demo-partner` couvre `/demo/api/partner` et n'accepte qu'un jeton d'accès, vérifié AVANT le contrôleur : signature, expiration, audience (`resource`). `stateless` : aucune session n'est lue ni créée. Un appelant Keycloak, qui n'a pas de compte ici, est admis le temps de la requête avec les seuls `ephemeralRoles`.",
          excerpt: {
            file: "nodefony/config/security.ts",
            region: "partner-area",
          },
        },
      ],
    },
    {
      layer: "controller",
      blocks: [
        {
          text: "L'API du programme ne contient AUCUN contrôle d'accès : toute la classe vit sous le chemin de la zone, et quand une action s'exécute, le firewall a déjà prouvé qui appelle.",
          excerpt: { file: API, region: "partner-class" },
        },
        {
          text: "`this.user` est l'identité que le jeton a établie ; l'émetteur (`iss`) dit QUI l'a prouvée — cette application, ou Keycloak.",
          excerpt: { file: API, region: "partner-whoami" },
        },
        {
          text: "Le guichet de cette page, hors de la zone `demo-partner` : il vit dans la zone `demo`, où la session identifie le visiteur. Le visiteur anonyme est refusé avant l'action (403), et le compte du jeton vient de la session — jamais d'un champ envoyé.",
          excerpt: { file: DESK, region: "partner-token-route" },
        },
      ],
    },
    {
      layer: "service",
      blocks: [
        {
          text: "Émettre un jeton est une logique, pas une route : elle vit dans un service, que la commande et le guichet obtiennent tous les deux. Une seule implémentation.",
          excerpt: { file: ISSUER, region: "partner-service" },
        },
        {
          text: "L'application signe un jeton pour un de ses comptes, valable cinq minutes, avec pour audience la ressource de la zone — lue dans la config VALIDÉE du firewall, jamais dans une URL recopiée. Ce jeton n'ouvre rien d'autre.",
          excerpt: { file: ISSUER, region: "partner-issue" },
        },
      ],
    },
    {
      layer: "command",
      blocks: [
        {
          text: "`npx nodefony demo:partner:call` fait ce que ferait un vrai programme : il obtient un jeton, puis appelle l'API avec `Authorization: Bearer …`. Chaque refus est traduit en geste de réparation, selon l'émetteur du jeton.",
          excerpt: { file: COMMAND, region: "partner-call" },
        },
      ],
    },
    {
      layer: "front",
      blocks: [
        {
          text: "Le contrat du guichet est PARTAGÉ : le contrôleur et la page importent le même chemin et le même type de réponse.",
          excerpt: {
            file: "frontend/src/partner/partnerApi.ts",
            region: "partner-token-contract",
          },
        },
        {
          text: "L'appel de la page : le jeton dans `Authorization`. Le cookie de session part aussi, et la zone l'ignore — d'où le 401 du premier essai, même connecté.",
          excerpt: {
            file: "frontend/src/partner/usePartnerLab.ts",
            region: "partner-fetch-client",
          },
        },
      ],
    },
    {
      layer: "devops",
      blocks: [
        {
          text: "Un vrai partenaire n'a pas les clés de l'application : il obtient son jeton chez un serveur d'identité, par le flux `client_credentials` (RFC 6749 §4.4), sans utilisateur ni navigateur. L'application ne connaît que l'adresse du realm ; le point de jeton est DÉCOUVERT depuis elle (RFC 8414), jamais recopié.",
          excerpt: { file: COMMAND, region: "partner-keycloak" },
        },
        {
          text: "En développement, tout est déjà en place : le compose de l'application lève Keycloak avec son realm, et `.env` porte l'adresse du realm et le secret du client machine de la démo — des valeurs PUBLIQUES de développement. Keycloak éteint, l'application démarre quand même, avec un avertissement.",
          snippet: {
            label: "Terminal",
            lines: [
              "docker compose --profile keycloak up -d",
              "npx nodefony demo:partner:call --issuer keycloak",
            ],
          },
        },
        {
          text: "Le jeton du partenaire doit porter l'audience de la zone `demo-partner`, et c'est le realm qui la lui donne. Un appel refusé (401) avec un jeton Keycloak ? La commande donne le geste : écrire le realm, puis l'importer dans la console Keycloak (Realm settings → Partial import).",
          snippet: {
            label: "Terminal",
            lines: [
              "npx nodefony security:keycloak:realm --write --machine <nom-de-l-app>-machine",
            ],
          },
        },
        {
          text: "Dans une vraie application (la démo, elle, ne part pas en production), ce sont deux variables du déploiement : l'adresse du realm, et le secret du client machine, posé comme un secret — secret Kubernetes, variable protégée de la CI —, jamais dans une image. Le partenaire, lui, ne reçoit que l'identifiant et le secret de SON client.",
          snippet: {
            label: "Variables du déploiement",
            lines: [
              "NF_KEYCLOAK_ISSUER=https://sso.exemple.com/realms/mon-app",
              "NF_KEYCLOAK_MACHINE_SECRET=<secret du client machine>",
            ],
          },
        },
      ],
    },
  ],
  decorators: [
    {
      name: "controller",
      from: "@nodefony/framework",
      role: "place toute la classe sous un chemin — ici celui que couvre la zone `demo-partner`.",
      file: API,
      region: "partner-class",
    },
    {
      name: "Inject",
      from: "nodefony",
      role: "fournit un service par son nom au constructeur.",
      file: API,
      region: "partner-class",
    },
    {
      name: "route",
      from: "@nodefony/framework",
      role: "une route : son nom, son chemin et sa méthode HTTP.",
      file: API,
      region: "partner-whoami",
    },
    {
      name: "IsGranted",
      from: "@nodefony/framework",
      role: "exige des rôles avant l'action : 401 sans identité, 403 quand l'identité ne les porte pas — l'anonyme d'une zone `anonymous` compris.",
      file: DESK,
      region: "partner-token-route",
    },
    {
      name: "injectable",
      from: "nodefony",
      role: "déclare un service du conteneur : un exemplaire, partagé par tous ceux qui le demandent.",
      file: ISSUER,
      region: "partner-service",
    },
  ],
  decoratedFiles: [API, DESK, ISSUER],
} as const satisfies ILesson;
