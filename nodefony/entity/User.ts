import { defineEntity } from "@nodefony/orm-core";
import { portableUserTable, FRAMEWORK_CONNECTOR } from "@nodefony/drizzle";

/**
 * L'entité `User` de cette application.
 *
 * **L'identité appartient à ton application**, pas au framework : c'est toi qui
 * décris cette table, qui y ajoutes tes champs et qui en portes les migrations.
 * Sans ce fichier, l'application marcherait en développement — où le schéma est
 * dérivé du code — et refuserait de servir en production, où personne ne créerait
 * la table.
 *
 * ## Ajouter tes propres champs
 *
 * Ne modifie pas ce fichier à la main : relance la commande avec tes champs, elle
 * réécrit l'entité avec les colonnes du contrat EN CLAIR, plus les tiennes.
 *
 * ```bash
 * nodefony create entity User "firstName:string(100)?" "department:string?"
 * ```
 *
 * Un champ obligatoire doit avoir une valeur par défaut (`role:string=membre`) ou
 * être facultatif (`department:string?`) : le framework crée des utilisateurs sans
 * le connaître — au semis d'un administrateur, à la première connexion par un
 * fournisseur externe — et ces créations échoueraient.
 *
 * ## Écrire et lire un champ métier
 *
 * En ÉCRITURE, `IUserRepository` est typé sur le contrat et refuse tes champs :
 * la porte est le dépôt générique, `orm.getRepository("User")`. En LECTURE il n'y
 * a rien à faire — le dépôt reporte toute colonne hors contrat sur l'utilisateur.
 *
 * ## Après un changement de schéma
 *
 * ```bash
 * nodefony orm:generate --name utilisateur   # écrit la migration
 * nodefony orm:migrate                       # l'applique
 * ```
 */
/**
 * La table, décrite pour TOUTES les bases, et EXPORTÉE.
 *
 * Aucun moteur n'est figé ici : au démarrage, la table est déclinée pour le
 * dialecte du connecteur, et `orm:generate` écrit la migration de cette base.
 * Changer de base ne touche pas ce fichier — seulement la configuration.
 *
 * Exportée, et pas seulement passée au descripteur, pour deux lecteurs : l'outil
 * qui écrit les migrations (un process séparé, qui cherche les tables exportées
 * dans `nodefony/entity/`), et toute entité qui te RÉFÉRENCE
 * (`{ kind: "ref", target: () => userTable }`).
 */
export const userTable = portableUserTable;

export const UserEntity = defineEntity({
  name: "User",
  module: "app",
  connector: FRAMEWORK_CONNECTOR,
  schema: userTable,
});

/**
 * Un utilisateur d'exemple, à la convention de TOUTE entité générée.
 *
 * 🔴 Il n'est pas là pour décorer : dès qu'une entité te RÉFÉRENCE
 * (`create entity Note "owner:ref:User"`), le test que le générateur écrit
 * importe `userSample` pour se fabriquer un parent. Sans cet export, ce test ne
 * compile pas — et c'est la première relation qu'une application écrit.
 *
 * Le mot de passe est celui d'un banc : il passe la politique du framework
 * (dix caractères au moins, et il ne reprend pas l'identifiant), sans quoi la
 * création échouerait sur un message parlant de mot de passe là où le test
 * croit éprouver une relation.
 *
 * @param n - un numéro qui rend l'identifiant unique dans une même passe.
 * @returns de quoi créer un utilisateur par la route de l'application.
 */
export const userSample = (n: number): Record<string, unknown> => ({
  username: `user-${n}`,
  password: "password-test-42",
});
