# Tableaux de bord d'exemple — journaux de l'application

Deux tableaux de bord prêts à importer, qui montrent la même chose dans deux outils : vue
d'ensemble (lignes, erreurs, requêtes HTTP, réponses 5xx, latence p95), activité par sévérité et
par famille de statut, trafic HTTP (latence, chemins, statuts), qui écrit (modules, catégories), et
les lignes elles-mêmes.

| Fichier                           | Outil                                         |
| --------------------------------- | --------------------------------------------- |
| `grafana-nodefony-logs.json`      | Grafana, sur une source de données Loki       |
| `opensearch-nodefony-logs.ndjson` | OpenSearch Dashboards, index `nodefony-logs*` |

**Ce sont des exemples : rien ne les charge par défaut.** Copiez-les, adaptez-les, importez ceux
qui vous servent.

## Ce qu'ils supposent

- `NF_LOG_FORMAT=json` : une ligne de journal = un enregistrement complet.
- Les panneaux HTTP lisent la ligne d'accès de **production** (`msgid: "audit"`). En
  développement, elle sort dans un autre format et ces panneaux restent vides.
- **Latence** : chaque ligne d'accès porte la durée de sa requête (`durationMs`), de son arrivée
  au dernier octet de la réponse, production comprise. Les panneaux de latence ne restent vides
  que si l'application a coupé le chronométrage (`timing.enabled: false`).
- **OpenSearch** : les champs HTTP (`http.status`, `http.path`, `http.durationMs`…) sont rangés par
  le pipeline d'ingestion que l'application pose à côté de son index au premier envoi. Un index
  créé AVANT ce pipeline garde ses anciens types : il se recrée.

## Importer dans Grafana

Par l'interface : _Dashboards → New → Import_, puis choisir le fichier et la source Loki.

Par provisionnement, pour qu'il soit chargé au démarrage de Grafana (`compose.yaml`, service
`grafana`), monter le fichier et déclarer un fournisseur :

```yaml
volumes:
  - ./docker/examples/dashboards/grafana-nodefony-logs.json:/var/lib/grafana/dashboards/nodefony-logs.json:ro
```

```yaml
# docker/grafana/provisioning/dashboards/nodefony.yaml
apiVersion: 1
providers:
  - name: nodefony
    type: file
    options:
      path: /var/lib/grafana/dashboards
```

## Importer dans OpenSearch Dashboards

```bash
curl -X POST "http://127.0.0.1:5601/api/saved_objects/_import?overwrite=true" \
  -H "osd-xsrf: true" \
  -F "file=@docker/examples/dashboards/opensearch-nodefony-logs.ndjson"
```

Le tableau de bord s'ouvre sous _Dashboards → Nodefony — journaux_. Si votre application écrit dans
un autre index (`log.opensearch.index`), changez le motif `nodefony-logs*` de l'objet
`index-pattern` avant l'import.
