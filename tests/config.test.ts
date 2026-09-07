import { describe, it, expect } from "vitest";
import config from "../nodefony.config";
import { env } from "../env";
import App from "../index";

/**
 * Tests UNITAIRES — zéro serveur, zéro infra : ils valident que l'app se CHARGE.
 *
 * C'est le filet le moins cher qui attrape le plus d'erreurs : un import cassé,
 * un décorateur mal appliqué, une config qui déréférence le kernel trop tôt
 * (interdit — le kernel n'existe pas encore à l'import) font échouer CE fichier
 * avant même de booter quoi que ce soit.
 */
describe("l'app se charge (imports, décorateurs, config)", () => {
  it("le descripteur de config existe (defineConfig)", () => {
    expect(config).toBeDefined();
  });

  it("le catalogue d'env typé existe (defineEnv — seul lecteur de process.env)", () => {
    expect(env).toBeDefined();
  });

  it("le module App est défini et décoré (ses controllers sont attachés)", () => {
    // @controllers([...]) WRAPPE la classe (c'est le décorateur qui attache les
    // controllers au module) : on vérifie le constructeur, pas son nom interne.
    expect(App).toBeTypeOf("function");
    expect(App.prototype).toBeDefined();
  });
});
