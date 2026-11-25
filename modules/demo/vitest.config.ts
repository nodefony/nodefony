import { defineConfig } from "vitest/config";

/**
 * Config Vitest du module — suite UNITAIRE, qui ne frappe jamais le réseau.
 *
 * ⚠️ Le bloc `oxc` est OBLIGATOIRE : Vitest transforme les tests via oxc/rolldown,
 * qui ne lit PAS le `experimentalDecorators` du tsconfig. Sans lui, les décorateurs
 * (@controller, @route, @services, DI) sortiraient bruts et Node lèverait
 * `SyntaxError` au chargement. Aucun type émis
 * n'est lu (`emitDecoratorMetadata: false`) : une dépendance se nomme par `@Inject`.
 *
 * ⚠️ Les `*.e2e.test.ts` sont EXCLUS, exactement comme dans l'application.
 * `nodefony create entity --module <ce module>` en pose un par ressource, et un
 * test de bout en bout suppose un serveur DÉMARRÉ : c'est la suite e2e de
 * l'application qui le lance, une fois pour toutes, puisqu'un module ne démarre
 * pas seul. Sans cette exclusion, `npm test` du module frappe un serveur absent
 * et échoue — chaque gabarit étant pourtant juste isolément.
 */
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "tests/**/*.e2e.test.ts"],
  },
  oxc: {
    decorator: { legacy: true, emitDecoratorMetadata: false },
  },
});
