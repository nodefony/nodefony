- **La PROVENANCE d'une requête n'est pas une PREUVE D'INTENTION — une mutation
  exige `@CsrfProtect`.** Le raisonnement qui vient, et qui est faux : « le
  firewall vérifie déjà `Sec-Fetch-Site`, donc une écriture est protégée ». Ces
  en-têtes sont posés par un NAVIGATEUR ; un programme qui parle en HTTP n'en
  envoie aucun, et la défense de provenance le laisse alors passer — c'est son
  rôle, elle distingue les sites, pas les intentions. Résultat mesuré : un
  `POST /api/cart/items` sans jeton rend `201`, et l'application croit avoir une
  défense. Toute action qui ÉCRIT porte donc `@CsrfProtect` explicitement. Le
  jeton ne se demande à AUCUN endpoint : une requête sûre (`GET`) vers la route
  protégée sème le cookie lisible `csrf-token`, et la mutation le rejoue dans
  l'en-tête `x-csrf-token` — c'est le double-submit, sinon `403`. La provenance
  et le jeton se cumulent ; l'une ne remplace jamais l'autre.

- **Une origine tierce refusée en 403 se DÉCLARE — elle ne s'exempte pas.** Quand
  les envois d'un partenaire sont rejetés alors que les tiens aboutissent, la
  cause est la défense CSRF, et le réflexe qui vient (`@CsrfExempt` sur la route,
  `checkOrigin: false`, `csrf.enabled: false`) fait passer le partenaire **et
  n'importe quel autre site** : la route cesse de distinguer qui que ce soit,
  c'est-à-dire exactement l'attaque que la défense arrêtait. La réponse est une
  ligne de configuration — ajoute l'origine au bloc `csrf` déjà présent dans
  `securityConfig`, `nodefony/config/security.ts` :

  ```ts
  csrf: {
    secret: ctx.env.NF_CSRF_SECRET,
    trustedOrigins: ["https://partenaire.example"],
  },
  ```

  La comparaison porte sur la chaîne d'origine ENTIÈRE (`scheme://host[:port]`) :
  ni joker, ni sous-domaine implicite — une origine par entrée. À ne pas
  confondre avec `cors.origins`, qui autorise EN PLUS le JS du tiers à **lire**
  tes réponses : un partenaire qui POSTE n'en a pas besoin, et les deux
  traversent la défense. Détail :
  `node_modules/@nodefony/security/docs/csrf.md` ; geste complet et pièges :
  skill **`nodefony-protect-route`**.

- **Utilisateurs et droits : tout existe, n'improvise RIEN.** Ces gestes
  couvrent l'essentiel, et chacun a sa doc installée (cf. la table « Où lire
  AVANT de coder », plus haut) ; le geste détaillé et ses pièges vivent dans le
  skill **`nodefony-protect-route`** :
  - **protéger un ESPACE de routes** (tout ce qui commence par un préfixe) :
    une zone de firewall dans `nodefony/config/security.ts`, dont le `pattern` est le
    PRÉFIXE lui-même — `pattern: "^/api/account"`, **jamais** la liste des
    routes du jour (`"^/api/account/(profile|invoices)"`). Énumérer marche à
    l'essai, passe la revue, et laisse la route sœur ajoutée ensuite NAÎTRE
    PUBLIQUE — rien ne le signale, la zone a l'air de couvrir l'espace. Quand
    des routes partagent un préfixe, ne les protège pas une par une ;
  - **protéger une action** : le décorateur `@IsGranted("ROLE_ADMIN")` sur la
    méthode — il vaut pour TOUS les transports (HTTP et socket), et se pose
    **en plus** de la zone de firewall (le firewall AUTHENTIFIE, `@IsGranted`
    AUTORISE) ;
  - **réserver TOUT un controller à une habilitation** : ne l'écris pas,
    demande-le — `npx nodefony create controller <nom> --role ROLE_X` pose la
    garde sur la CLASSE (donc sur les actions à venir) **et** déclare le rôle
    sous `ROLE_ADMIN` dans `roleHierarchy`. Les deux gestes vont ensemble, et
    c'est le second qu'on oublie en les faisant à la main ;
  - **lire l'utilisateur courant** : le paramètre décoré `@CurrentUser()`
    (typé `IUser` de `@nodefony/user`) — l'identité est ré-résolue à chaque
    requête, donc les rôles sont frais et une révocation prend effet tout de
    suite. N'écris pas ton propre lecteur de session ;
  - **déclarer qu'un rôle en implique un autre** : la clé `roleHierarchy` de
    la config du module de sécurité (`ROLE_ADMIN` hérite `ROLE_USER`) — que
    `create controller --role` remplit pour toi quand le rôle naît avec son
    controller. Elle
    est aplatie au boot ; n'écris pas de test d'appartenance à la main — et
    n'énumère pas non plus les rôles du jour sur l'action.
    `@IsGranted(["ROLE_BILLING", "ROLE_ADMIN"])` accorde bien l'accès (un
    attribut suffit), mais la relation entre ces deux rôles n'existe alors
    NULLE PART : la route sœur ajoutée demain devra répéter la liste, et
    l'oubli ne se voit sur aucune route. C'est le piège de la puce
    précédente, un cran plus haut — énumérer ce qu'on a sous les yeux au
    lieu de déclarer la règle ;
  - **créer un compte** : la commande `npx nodefony security:user:add <identifiant>`.
    Ne fabrique pas d'utilisateur en insérant directement dans la base — le mot
    de passe passe par l'encodeur du framework.
  - **ouvrir une API à un PROGRAMME** (service partenaire, script, agent — pas
    un navigateur) : cette zone est **déjà posée** dans `nodefony/config/security.ts` —

    ```ts
    machine: {
      pattern: "^/api/machine",
      authenticators: ["apikey"], // PAS "session" — ce client n'a pas de cookie
      stateless: true, // false ⇒ un registre de sessions pour un client qui ne le relit pas
    },
    ```

    Pour une route **NEUVE**, fais-la **tomber sous `/api/machine`** plutôt que
    d'ajouter une zone : celle-ci est déjà réglée, et une seconde zone au
    pattern plus court la coifferait sans prévenir (le firewall trie par
    longueur de pattern).

    🔴 **Mais une URL DÉJÀ PUBLIÉE ne se déplace pas — c'est un contrat.** Quand
    on te demande de protéger une adresse existante (`/api/partenaire/depot`),
    la déménager sous `/api/machine` la fait répondre `404` à celui-là même
    qu'on voulait servir : le partenaire appelle l'ancienne, personne ne l'a
    prévenu, et rien dans l'application ne signale la rupture. Vécu, et le
    contrôle l'a vu — clé d'API valide, `404`. **On adapte la ZONE à l'URL,
    jamais l'URL à la zone** : étends le `pattern` de la zone `machine` pour
    qu'il couvre aussi l'adresse en place —

    ```ts
    machine: {
      pattern: "^/api/(machine|partenaire)",
      authenticators: ["apikey"],
      stateless: true,
    },
    ```

    Une URL ne se déplace que si l'énoncé le demande, et alors l'ancienne
    redirige.

    ⚠️ `stateless: false` (le défaut) **ne fait pas échouer l'essai**, et c'est
    tout le piège : depuis un navigateur ou un `curl -c`, le cookie posé revient
    aux requêtes suivantes et tout semble marcher. Ce que ça coûte n'est pas un
    refus mais un **registre** — chaque appel portant un cookie inconnu fait
    reprendre puis réécrire une session serveur, et renvoyer un `Set-Cookie`,
    pour un appelant qui ne la relira jamais. `stateless: true` ferme cela : la
    zone n'ouvre ni ne reprend de session, et le cookie entrant est ignoré.
    Lister `"session"` dans une zone stateless est une contradiction, et
    l'application **refuse de démarrer** en nommant la zone. Règle : un appelant
    qui ne stocke pas de cookie ne doit rien recevoir qu'il faille stocker.
    Les clés s'émettent par `POST /nodefony/security/api/keys`.

  - Un droit **métier** qui ne se réduit pas à un rôle (« l'auteur peut éditer
    SON document ») s'écrit en **voter** et s'enregistre par
    `registerVoterFactory` ; `@IsGranted("doc.edit", { subject: "id" })` l'appelle.
    C'est le point d'extension prévu — il n'y a pas de table de permissions à
    inventer.
