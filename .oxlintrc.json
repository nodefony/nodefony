{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "promise", "import"],
  "categories": {
    "correctness": "error",
    "suspicious": "warn",
    "perf": "warn"
  },
  "env": { "node": true, "es2024": true },
  "ignorePatterns": ["node_modules/**", "dist/**", "var/**", "*.log"],
  "rules": {
    "no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrors": "none"
      }
    ],
    "no-restricted-imports": [
      "error",
      {
        "paths": [
          {
            "name": "assert",
            "message": "Préfixe Node obligatoire : importe \"node:assert\"."
          },
          {
            "name": "buffer",
            "message": "Préfixe Node obligatoire : importe \"node:buffer\"."
          },
          {
            "name": "child_process",
            "message": "Préfixe Node obligatoire : importe \"node:child_process\"."
          },
          {
            "name": "crypto",
            "message": "Préfixe Node obligatoire : importe \"node:crypto\"."
          },
          {
            "name": "events",
            "message": "Préfixe Node obligatoire : importe \"node:events\"."
          },
          {
            "name": "fs",
            "message": "Préfixe Node obligatoire : importe \"node:fs\"."
          },
          {
            "name": "fs/promises",
            "message": "Préfixe Node obligatoire : importe \"node:fs/promises\"."
          },
          {
            "name": "http",
            "message": "Préfixe Node obligatoire : importe \"node:http\"."
          },
          {
            "name": "http2",
            "message": "Préfixe Node obligatoire : importe \"node:http2\"."
          },
          {
            "name": "https",
            "message": "Préfixe Node obligatoire : importe \"node:https\"."
          },
          {
            "name": "net",
            "message": "Préfixe Node obligatoire : importe \"node:net\"."
          },
          {
            "name": "os",
            "message": "Préfixe Node obligatoire : importe \"node:os\"."
          },
          {
            "name": "path",
            "message": "Préfixe Node obligatoire : importe \"node:path\"."
          },
          {
            "name": "process",
            "message": "Préfixe Node obligatoire : importe \"node:process\"."
          },
          {
            "name": "stream",
            "message": "Préfixe Node obligatoire : importe \"node:stream\"."
          },
          {
            "name": "timers",
            "message": "Préfixe Node obligatoire : importe \"node:timers\"."
          },
          {
            "name": "url",
            "message": "Préfixe Node obligatoire : importe \"node:url\"."
          },
          {
            "name": "util",
            "message": "Préfixe Node obligatoire : importe \"node:util\"."
          },
          {
            "name": "worker_threads",
            "message": "Préfixe Node obligatoire : importe \"node:worker_threads\"."
          }
        ]
      }
    ],
    // Une feuille de style s'importe POUR SON EFFET, sans rien affecter : c'est
    // la seule forme qu'un bundler accepte. La règle reste utile ailleurs (un
    // module importé pour effet de bord et oublié), d'où l'exception ciblée
    // plutôt que l'extinction.
    "import/no-unassigned-import": [
      "warn",
      { "allow": ["**/*.css", "**/*.scss", "**/*.sass", "**/*.less"] }
    ],
    "typescript/no-explicit-any": "warn",
    "typescript/ban-ts-comment": "warn",
    // ESM strict : une application Nodefony n'écrit jamais `require`.
    "typescript/no-require-imports": "warn",
    "no-eval": "error",
    "no-new-func": "error",
    "no-await-in-loop": "off",
    "no-console": "off",
    "unicorn/no-array-reverse": "off",
    "unicorn/consistent-function-scoping": "off",
    "typescript/no-extraneous-class": "off"
  },
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/*.spec.ts", "tests/**/*.ts"],
      "rules": {
        "typescript/no-explicit-any": "off",
        "no-unused-vars": "off",
        "no-unused-expressions": "off",
        "no-restricted-imports": "off",
        "promise/no-callback-in-promise": "off"
      }
    }
  ]
}
