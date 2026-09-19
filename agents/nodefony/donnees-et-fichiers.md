- **Un adaptateur de données ne remplace pas l'autre : ils se COMPLÈTENT.** Chacun
  déclare les _stores_ qu'il sait tenir (`nodefony.stores` de son `package.json`) —
  `drizzle` les huit (session, user, tokens, passkeys, totp, audit, webhooks,
  idempotency), `mongoose` cinq (ni `totp`, ni `audit`, ni `idempotency`), `redis`
  quatre. Ce n'est pas un retard de développement mais un CHOIX : un journal
  d'audit n'a rien à faire dans un moteur documentaire. Ne promets donc jamais une
  parité qui n'existe pas, et vérifie où atterrit chaque donnée :
  `npx nodefony inspect stores`. Le détail par brique :
  `node_modules/nodefony/docs/catalogue.md`.

- **Les violations de contrainte sont DÉJÀ traduites en HTTP — ne les rattrape pas.**
  Un doublon sur une colonne unique ressort en **409**, une donnée qui viole le
  schéma Zod en **422**, chacun avec son corps JSON : le rendu d'erreur lit le code
  du pilote (`23505` PostgreSQL, `ER_DUP_ENTRY` MySQL, `SQLITE_CONSTRAINT_UNIQUE`,
  `11000` MongoDB) et le mappe, quel que soit le moteur. N'écris donc JAMAIS un
  `throw … 409` dans un service pour un `sku` déjà pris. Le vérifier toi-même
  d'abord (« existe-t-il ? » puis insertion) est plus lent ET **faux sous
  concurrence** : deux requêtes simultanées passent toutes les deux le test avant
  que l'une n'écrive. La contrainte de la base est le seul arbitre exact — laisse-la
  lever, le pipeline traduit.

- **Un fichier ne se sert pas à la main.** Trois façades, et le choix se fait sur
  l'usage : `this.renderMediaStream(file)` implémente les **requêtes par plage**
  (`Range` → 206 + `Content-Range`, 416 hors plage) — c'est ce qu'exige un lecteur
  vidéo ou audio pour se déplacer ; `this.streamFile(file)` envoie le fichier
  ENTIER en flux, sans plage ; `this.renderFileDownload(file)` force le
  téléchargement. Recomposer ça avec `createReadStream` et `response.write`
  compile, passe les tests — et rend une réponse **incohérente** : un statut posé
  à la main n'atteint jamais la socket (le pipeline écrit statut et en-têtes à
  SON tour), donc le client reçoit **200 avec un corps partiel** et croit tenir le
  fichier complet. Mesuré au banc, pas supposé.
