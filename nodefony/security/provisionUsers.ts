import type { Module } from "nodefony";
import { ormRegistry } from "@nodefony/orm-core";
import { InMemoryUserRepository, UserService } from "@nodefony/user";
import type { IPasswordEncoder } from "@nodefony/user";
import { DrizzleUserRepository } from "@nodefony/drizzle";
import type { DrizzleOrm } from "@nodefony/drizzle";
import { env } from "../../env";

const LOG_CTX = "USERS";

/** Identifiant (login) du compte administrateur seedé au premier boot. */
export const ADMIN_IDENTIFIER = "admin";

/**
 * Rôles du compte admin — donnés À PLAT (en plus de la hiérarchie déclarée dans
 * `nodefony.config.ts`) : `ROLE_NODEFONY_ADMIN` ouvre la console Studio
 * (`/nodefony`), `ROLE_ADMIN` la gestion applicative des utilisateurs.
 */
export const ADMIN_ROLES = ["ROLE_ADMIN", "ROLE_NODEFONY_ADMIN"];

/**
 * Pose le service applicatif `"users"` (la source d'identité du firewall) au
 * démarrage de l'app, puis seed le compte admin s'il n'existe pas.
 *
 * **C'est la responsabilité de TON application, pas du framework** :
 * `@nodefony/security` sait *authentifier*, mais c'est l'app qui décide *qui*
 * sont ses utilisateurs et *où* ils sont stockés. Sans ce service, toutes les
 * méthodes d'auth (mot de passe, JWT, social) échouent avec
 * « aucun service users ».
 *
 * Dépôt : Drizzle (SQL — sqlite local par défaut, `NF_DATABASE_URL` pour une
 * vraie base). Si l'ORM n'est pas chargé (module retiré du manifeste), repli
 * ANNONCÉ sur un annuaire mémoire volatil — l'auth marche, mais les comptes ne
 * survivent pas au redémarrage.
 *
 * Mot de passe admin :
 * - DÉVELOPPEMENT : `admin` / `admin` par défaut (local uniquement — même
 *   esprit que Grafana). Surcharge : `NF_ADMIN_PASSWORD` dans `.env.local`.
 * - PRODUCTION : `NF_ADMIN_PASSWORD` OBLIGATOIRE (secret-manager) — sans lui,
 *   AUCUN compte n'est créé (jamais de mot de passe par défaut en prod) et un
 *   WARNING explique quoi faire (`nodefony security:user:add`).
 *
 * Idempotent et non destructif : ne remplace jamais un annuaire déjà posé, ne
 * recrée jamais un compte existant.
 *
 * @param module - le module applicatif (`App`) — fournit container, kernel, log.
 */
export async function provisionUsers(module: Module): Promise<void> {
  const container = module.container;
  if (!container || container.has("users")) {
    return;
  }

  // L'encodeur (Argon2id par défaut) est posé par le firewall (@nodefony/security).
  // Son absence = module security non chargé → échec franc, pas de fallback muet.
  const encoder = container.get<IPasswordEncoder>("passwordEncoder");
  if (!encoder) {
    throw new Error(
      `provisionUsers: service "passwordEncoder" absent — le module ` +
        `@nodefony/security est-il chargé dans nodefony.config.ts ?`,
    );
  }

  // `get()` LÈVE sur un nom inconnu : interroger AVANT, sinon ce repli
  // fail-soft — tout l'objet du bloc qui suit — ne s'exécute jamais et le
  // boot casse là où il devait dégrader.
  const orm = ormRegistry.has("default")
    ? (ormRegistry.get("default") as DrizzleOrm)
    : undefined;
  if (!orm) {
    // Repli ANNONCÉ (jamais silencieux) : sans ORM, annuaire mémoire volatil.
    module.log(
      `ORM "default" absent (module @nodefony/drizzle retiré ?) → annuaire ` +
        `utilisateurs EN MÉMOIRE : les comptes ne survivront pas au redémarrage.`,
      "WARNING",
      LOG_CTX,
    );
    const users = new UserService(new InMemoryUserRepository([]), encoder);
    container.set("users", users);
    await seedAdmin(users, module);
    return;
  }

  const users = new UserService(DrizzleUserRepository.from(orm), encoder);
  container.set("users", users);
  await seedAdmin(users, module);
}

/**
 * Crée le compte admin s'il n'existe pas (idempotent). Le hash Argon2id est
 * fait par `UserService.createUser` — jamais de mot de passe en clair stocké.
 *
 * @param users - service utilisateur branché sur son dépôt.
 * @param module - module applicatif (logs + environnement).
 */
async function seedAdmin(users: UserService, module: Module): Promise<void> {
  if (await users.findByIdentifier(ADMIN_IDENTIFIER)) {
    return;
  }
  const isProd = module.kernel?.environment === "production";
  const password = env.NF_ADMIN_PASSWORD ?? (isProd ? null : "admin");
  if (!password) {
    module.log(
      `Aucun admin et NF_ADMIN_PASSWORD non défini → aucun compte seedé en ` +
        `production. Définis NF_ADMIN_PASSWORD (secret-manager) ou crée un ` +
        `compte : \`npx nodefony security:user:add admin --admin\`.`,
      "WARNING",
      LOG_CTX,
    );
    return;
  }
  await users.createUser({
    identifier: ADMIN_IDENTIFIER,
    plainPassword: password,
    roles: ADMIN_ROLES,
  });
  module.log(
    isProd
      ? `Compte admin seedé (mot de passe : NF_ADMIN_PASSWORD).`
      : `Compte admin seedé — connexion : admin / ${env.NF_ADMIN_PASSWORD ? "(NF_ADMIN_PASSWORD)" : "admin"} (Studio : /nodefony).`,
    "INFO",
    LOG_CTX,
  );
}
