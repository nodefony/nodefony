# @nodefony/demo

Démo de nodefony — ce que Nodefony sait faire, dans du code qui tourne

Module applicatif Nodefony — un **workspace npm**
(`modules/demo/`) chargé par le
manifeste `modules` de `nodefony.config.ts` de l'app :

```ts
use("@nodefony/demo", { enabled: true }),
```

## Configuration

- `enabled` (`boolean`, défaut `true`) — interrupteur du module.
- `greeting` (`string`, défaut `"Bonjour de demo"`) — exemple de champ, à
  remplacer par la vôtre.

La source unique est le schéma Zod de `nodefony/config/config.ts` : c'est lui qui porte
les défauts, les descriptions et la validation. Une clé inconnue ou mal typée fait échouer
le **boot**, en nommant le champ fautif.

## Développer

```bash
npm run build       # rolldown → dist/ (le Kernel charge dist/index.js)
npm run typecheck   # tsgo --noEmit
npm test            # vitest
```

En développement, le serveur (`npm run dev` à la racine de l'app) surveille les sources et
reconstruit tout seul : pas besoin de builder à la main à chaque changement.

## Ajouter des briques

Depuis la **racine de l'app** :

```bash
nodefony create controller articles --module demo   # HTTP + WebSocket
nodefony create front dashboard --module demo       # page Vite (React/Vue/Angular)
```

Les deux commandes câblent elles-mêmes l'`index.ts` du module.

## Structure

```
modules/demo/
├── index.ts                    ← la classe Module (controllers, services, config)
├── nodefony/
│   ├── config/config.ts        ← schéma Zod = source unique des défauts
│   ├── config/defineModuleConfig.ts ← builder pur (valide, gèle)
│   └── src/errors/             ← erreurs typées (code machine + contexte)
├── docs/                       ← documentation, surfacée dans Studio
└── tests/
```
