{
  "title": "Nodefony — journaux",
  "uid": "nodefony-logs",
  "description": "Exemple livré par Nodefony : journaux d'une application (Loki, log.format json).",
  "tags": ["nodefony", "logs"],
  "editable": true,
  "graphTooltip": 1,
  "schemaVersion": 41,
  "version": 1,
  "time": { "from": "now-1h", "to": "now" },
  "refresh": "30s",
  "timezone": "browser",
  "templating": {
    "list": [
      {
        "type": "datasource",
        "name": "datasource",
        "label": "Source",
        "query": "loki",
        "current": {},
        "hide": 0
      },
      {
        "type": "query",
        "name": "app",
        "label": "Application",
        "datasource": { "type": "loki", "uid": "${datasource}" },
        "query": {
          "qryType": 1,
          "query": "label_values(app)",
          "refId": "LokiVariableQueryEditor-VariableQuery"
        },
        "definition": "label_values(app)",
        "refresh": 2,
        "multi": true,
        "includeAll": true,
        "allValue": ".+",
        "current": { "selected": true, "text": ["All"], "value": ["$__all"] }
      },
      {
        "type": "custom",
        "name": "severity",
        "label": "Sévérité",
        "query": "EMERGENCY,ALERT,CRITIC,ERROR,WARNING,NOTICE,INFO,DEBUG",
        "multi": true,
        "includeAll": true,
        "allValue": ".*",
        "current": { "selected": true, "text": ["All"], "value": ["$__all"] }
      },
      {
        "type": "query",
        "name": "module",
        "label": "Module",
        "datasource": { "type": "loki", "uid": "${datasource}" },
        "query": {
          "qryType": 1,
          "query": "label_values({app=~\"$app\"}, module)",
          "refId": "LokiVariableQueryEditor-VariableQuery"
        },
        "definition": "label_values({app=~\"$app\"}, module)",
        "refresh": 2,
        "multi": true,
        "includeAll": true,
        "allValue": ".*",
        "current": { "selected": true, "text": ["All"], "value": ["$__all"] }
      },
      {
        "type": "textbox",
        "name": "search",
        "label": "Recherche",
        "query": "",
        "current": { "text": "", "value": "" }
      },
      {
        "type": "textbox",
        "name": "requestId",
        "label": "requestId",
        "query": "",
        "current": { "text": "", "value": "" }
      }
    ]
  },
  "annotations": { "list": [] },
  "panels": [
    {
      "type": "text",
      "title": "",
      "id": 1,
      "gridPos": { "x": 0, "y": 0, "w": 24, "h": 5 },
      "options": {
        "mode": "markdown",
        "content": "**Journaux d'une application Nodefony.** Vue d'ensemble, activité, trafic HTTP, et les lignes elles-mêmes.\n\nLes panneaux HTTP lisent la ligne d'accès de **production** (`msgid: audit`), écrite avec `log.format: \"json\"` : en développement, elle sort dans un autre format et ces panneaux restent vides.\n\n**Latence** : chaque ligne d'accès porte la durée de sa requête (`durationMs`), de l'arrivée à la fin de la réponse — production comprise. Seul `timing.enabled: false` la retire.\n\nUne ligne mène à toute sa requête : copier son `requestId` dans le filtre du même nom."
      }
    },
    {
      "type": "row",
      "title": "Vue d'ensemble",
      "collapsed": false,
      "gridPos": { "x": 0, "y": 5, "w": 24, "h": 1 },
      "id": 2,
      "panels": []
    },
    {
      "type": "stat",
      "title": "Lignes",
      "id": 3,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 0, "y": 6, "w": 4, "h": 4 },
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "sum(count_over_time({app=~\"$app\"} |= \"$requestId\" |~ \"(?i)$search\" | json | severityName=~\"$severity\" | moduleName=~\"$module\" [$__range]))",
          "queryType": "instant",
          "instant": true,
          "range": false
        }
      ],
      "options": {
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "colorMode": "background_solid",
        "graphMode": "none",
        "justifyMode": "center",
        "textMode": "value",
        "wideLayout": true
      },
      "fieldConfig": {
        "defaults": {
          "unit": "short",
          "noValue": "0",
          "color": { "mode": "thresholds" },
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "#3B82F6", "value": null }]
          }
        },
        "overrides": []
      }
    },
    {
      "type": "stat",
      "title": "Erreurs",
      "id": 4,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 4, "y": 6, "w": 4, "h": 4 },
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "sum(count_over_time({app=~\"$app\"} |= \"$requestId\" |~ \"(?i)$search\" | json | severityName=~\"$severity\" | moduleName=~\"$module\" | severityName=~\"EMERGENCY|ALERT|CRITIC|ERROR\" [$__range]))",
          "queryType": "instant",
          "instant": true,
          "range": false
        }
      ],
      "options": {
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "colorMode": "background_solid",
        "graphMode": "none",
        "justifyMode": "center",
        "textMode": "value",
        "wideLayout": true
      },
      "fieldConfig": {
        "defaults": {
          "unit": "short",
          "noValue": "0",
          "color": { "mode": "thresholds" },
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "#22A06B", "value": null },
              { "color": "#E5484D", "value": 1 }
            ]
          }
        },
        "overrides": []
      }
    },
    {
      "type": "stat",
      "title": "Avertissements",
      "id": 5,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 8, "y": 6, "w": 4, "h": 4 },
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "sum(count_over_time({app=~\"$app\"} |= \"$requestId\" |~ \"(?i)$search\" | json | severityName=~\"$severity\" | moduleName=~\"$module\" | severityName=\"WARNING\" [$__range]))",
          "queryType": "instant",
          "instant": true,
          "range": false
        }
      ],
      "options": {
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "colorMode": "background_solid",
        "graphMode": "none",
        "justifyMode": "center",
        "textMode": "value",
        "wideLayout": true
      },
      "fieldConfig": {
        "defaults": {
          "unit": "short",
          "noValue": "0",
          "color": { "mode": "thresholds" },
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "#22A06B", "value": null },
              { "color": "#F59E0B", "value": 1 }
            ]
          }
        },
        "overrides": []
      }
    },
    {
      "type": "stat",
      "title": "Requêtes HTTP",
      "id": 6,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 12, "y": 6, "w": 4, "h": 4 },
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "sum(count_over_time({app=~\"$app\"} |= \"audit\" |= \"$requestId\" | json | msgid=\"audit\" | moduleName=~\"$module\" | line_format \"{{.payload}}\" | json status=\"status\", method=\"method\", url=\"url\", duration=\"durationMs\" | label_format path=`{{ regexReplaceAll \"^[a-z]+://[^/]+|[?#].*$\" .url \"\" }}`, family=`{{ regexReplaceAll \"^([1-5])[0-9][0-9]$\" .status \"${1}xx\" }}` [$__range]))",
          "queryType": "instant",
          "instant": true,
          "range": false
        }
      ],
      "options": {
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "colorMode": "background_solid",
        "graphMode": "none",
        "justifyMode": "center",
        "textMode": "value",
        "wideLayout": true
      },
      "fieldConfig": {
        "defaults": {
          "unit": "short",
          "noValue": "0",
          "color": { "mode": "thresholds" },
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "#3B82F6", "value": null }]
          }
        },
        "overrides": []
      }
    },
    {
      "type": "stat",
      "title": "Réponses 5xx",
      "id": 7,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 16, "y": 6, "w": 4, "h": 4 },
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "sum(count_over_time({app=~\"$app\"} |= \"audit\" |= \"$requestId\" | json | msgid=\"audit\" | moduleName=~\"$module\" | line_format \"{{.payload}}\" | json status=\"status\", method=\"method\", url=\"url\", duration=\"durationMs\" | label_format path=`{{ regexReplaceAll \"^[a-z]+://[^/]+|[?#].*$\" .url \"\" }}`, family=`{{ regexReplaceAll \"^([1-5])[0-9][0-9]$\" .status \"${1}xx\" }}` | family=\"5xx\" [$__range]))",
          "queryType": "instant",
          "instant": true,
          "range": false
        }
      ],
      "options": {
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "colorMode": "background_solid",
        "graphMode": "none",
        "justifyMode": "center",
        "textMode": "value",
        "wideLayout": true
      },
      "fieldConfig": {
        "defaults": {
          "unit": "short",
          "noValue": "0",
          "color": { "mode": "thresholds" },
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "#22A06B", "value": null },
              { "color": "#E5484D", "value": 1 }
            ]
          }
        },
        "overrides": []
      }
    },
    {
      "type": "stat",
      "title": "Latence p95",
      "id": 8,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 20, "y": 6, "w": 4, "h": 4 },
      "description": "Durée de chaque requête (durationMs), de l'arrivée à la fin de la réponse. Vide seulement si l'application a coupé le chronométrage (timing.enabled: false).",
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "quantile_over_time(0.95, {app=~\"$app\"} |= \"audit\" |= \"$requestId\" | json | msgid=\"audit\" | moduleName=~\"$module\" | line_format \"{{.payload}}\" | json status=\"status\", method=\"method\", url=\"url\", duration=\"durationMs\" | label_format path=`{{ regexReplaceAll \"^[a-z]+://[^/]+|[?#].*$\" .url \"\" }}`, family=`{{ regexReplaceAll \"^([1-5])[0-9][0-9]$\" .status \"${1}xx\" }}` | unwrap duration | __error__=\"\" [$__range]) by ()",
          "queryType": "instant",
          "instant": true,
          "range": false
        }
      ],
      "options": {
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "colorMode": "background_solid",
        "graphMode": "none",
        "justifyMode": "center",
        "textMode": "value",
        "wideLayout": true
      },
      "fieldConfig": {
        "defaults": {
          "unit": "ms",
          "decimals": 1,
          "noValue": "non mesurée",
          "color": { "mode": "thresholds" },
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "#22A06B", "value": null },
              { "color": "#F59E0B", "value": 300 },
              { "color": "#E5484D", "value": 1000 }
            ]
          }
        },
        "overrides": []
      }
    },
    {
      "type": "row",
      "title": "Activité",
      "collapsed": false,
      "gridPos": { "x": 0, "y": 10, "w": 24, "h": 1 },
      "id": 9,
      "panels": []
    },
    {
      "type": "timeseries",
      "title": "Lignes par sévérité",
      "maxDataPoints": 60,
      "id": 10,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 0, "y": 11, "w": 12, "h": 8 },
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "sum by (severityName) (count_over_time({app=~\"$app\"} |= \"$requestId\" |~ \"(?i)$search\" | json | severityName=~\"$severity\" | moduleName=~\"$module\" [$__auto]))",
          "legendFormat": "{{severityName}}"
        }
      ],
      "options": {
        "legend": {
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "mode": "multi", "sort": "desc" }
      },
      "fieldConfig": {
        "defaults": {
          "unit": "short",
          "custom": {
            "drawStyle": "bars",
            "barAlignment": 0,
            "fillOpacity": 85,
            "lineWidth": 0,
            "stacking": { "mode": "normal", "group": "A" },
            "axisSoftMin": 0
          },
          "color": { "mode": "palette-classic" }
        },
        "overrides": [
          {
            "matcher": { "id": "byName", "options": "EMERGENCY" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#8F1D1D" }
              }
            ]
          },
          {
            "matcher": { "id": "byName", "options": "ALERT" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#B42318" }
              }
            ]
          },
          {
            "matcher": { "id": "byName", "options": "CRITIC" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#C4314B" }
              }
            ]
          },
          {
            "matcher": { "id": "byName", "options": "ERROR" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#E5484D" }
              }
            ]
          },
          {
            "matcher": { "id": "byName", "options": "WARNING" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#F59E0B" }
              }
            ]
          },
          {
            "matcher": { "id": "byName", "options": "NOTICE" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#8B5CF6" }
              }
            ]
          },
          {
            "matcher": { "id": "byName", "options": "INFO" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#3B82F6" }
              }
            ]
          },
          {
            "matcher": { "id": "byName", "options": "DEBUG" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#9CA3AF" }
              }
            ]
          }
        ]
      }
    },
    {
      "type": "timeseries",
      "title": "Requêtes par famille de statut",
      "maxDataPoints": 60,
      "id": 11,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 12, "y": 11, "w": 12, "h": 8 },
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "sum by (family) (count_over_time({app=~\"$app\"} |= \"audit\" |= \"$requestId\" | json | msgid=\"audit\" | moduleName=~\"$module\" | line_format \"{{.payload}}\" | json status=\"status\", method=\"method\", url=\"url\", duration=\"durationMs\" | label_format path=`{{ regexReplaceAll \"^[a-z]+://[^/]+|[?#].*$\" .url \"\" }}`, family=`{{ regexReplaceAll \"^([1-5])[0-9][0-9]$\" .status \"${1}xx\" }}` [$__auto]))",
          "legendFormat": "{{family}}"
        }
      ],
      "options": {
        "legend": {
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "mode": "multi", "sort": "desc" }
      },
      "fieldConfig": {
        "defaults": {
          "unit": "short",
          "custom": {
            "drawStyle": "bars",
            "barAlignment": 0,
            "fillOpacity": 85,
            "lineWidth": 0,
            "stacking": { "mode": "normal", "group": "A" },
            "axisSoftMin": 0
          },
          "color": { "mode": "palette-classic" }
        },
        "overrides": [
          {
            "matcher": { "id": "byName", "options": "2xx" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#22A06B" }
              }
            ]
          },
          {
            "matcher": { "id": "byName", "options": "3xx" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#3B82F6" }
              }
            ]
          },
          {
            "matcher": { "id": "byName", "options": "4xx" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#F59E0B" }
              }
            ]
          },
          {
            "matcher": { "id": "byName", "options": "5xx" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#E5484D" }
              }
            ]
          }
        ]
      }
    },
    {
      "type": "row",
      "title": "HTTP",
      "collapsed": false,
      "gridPos": { "x": 0, "y": 19, "w": 24, "h": 1 },
      "id": 12,
      "panels": []
    },
    {
      "type": "timeseries",
      "title": "Latence des requêtes",
      "description": "Durée de chaque requête (durationMs), de l'arrivée à la fin de la réponse. Vide seulement si l'application a coupé le chronométrage (timing.enabled: false).",
      "maxDataPoints": 60,
      "id": 13,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 0, "y": 20, "w": 12, "h": 8 },
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "quantile_over_time(0.50, {app=~\"$app\"} |= \"audit\" |= \"$requestId\" | json | msgid=\"audit\" | moduleName=~\"$module\" | line_format \"{{.payload}}\" | json status=\"status\", method=\"method\", url=\"url\", duration=\"durationMs\" | label_format path=`{{ regexReplaceAll \"^[a-z]+://[^/]+|[?#].*$\" .url \"\" }}`, family=`{{ regexReplaceAll \"^([1-5])[0-9][0-9]$\" .status \"${1}xx\" }}` | unwrap duration | __error__=\"\" [$__auto]) by ()",
          "legendFormat": "p50"
        },
        {
          "refId": "B",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "quantile_over_time(0.95, {app=~\"$app\"} |= \"audit\" |= \"$requestId\" | json | msgid=\"audit\" | moduleName=~\"$module\" | line_format \"{{.payload}}\" | json status=\"status\", method=\"method\", url=\"url\", duration=\"durationMs\" | label_format path=`{{ regexReplaceAll \"^[a-z]+://[^/]+|[?#].*$\" .url \"\" }}`, family=`{{ regexReplaceAll \"^([1-5])[0-9][0-9]$\" .status \"${1}xx\" }}` | unwrap duration | __error__=\"\" [$__auto]) by ()",
          "legendFormat": "p95"
        },
        {
          "refId": "C",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "quantile_over_time(0.99, {app=~\"$app\"} |= \"audit\" |= \"$requestId\" | json | msgid=\"audit\" | moduleName=~\"$module\" | line_format \"{{.payload}}\" | json status=\"status\", method=\"method\", url=\"url\", duration=\"durationMs\" | label_format path=`{{ regexReplaceAll \"^[a-z]+://[^/]+|[?#].*$\" .url \"\" }}`, family=`{{ regexReplaceAll \"^([1-5])[0-9][0-9]$\" .status \"${1}xx\" }}` | unwrap duration | __error__=\"\" [$__auto]) by ()",
          "legendFormat": "p99"
        }
      ],
      "options": {
        "legend": {
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "mode": "multi", "sort": "desc" }
      },
      "fieldConfig": {
        "defaults": {
          "unit": "ms",
          "custom": {
            "drawStyle": "line",
            "lineWidth": 2,
            "fillOpacity": 10,
            "showPoints": "never",
            "spanNulls": true,
            "axisSoftMin": 0
          },
          "color": { "mode": "palette-classic" }
        },
        "overrides": [
          {
            "matcher": { "id": "byName", "options": "p50" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#22A06B" }
              }
            ]
          },
          {
            "matcher": { "id": "byName", "options": "p95" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#F59E0B" }
              }
            ]
          },
          {
            "matcher": { "id": "byName", "options": "p99" },
            "properties": [
              {
                "id": "color",
                "value": { "mode": "fixed", "fixedColor": "#E5484D" }
              }
            ]
          }
        ]
      }
    },
    {
      "type": "bargauge",
      "title": "Chemins les plus sollicités",
      "id": 14,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 12, "y": 20, "w": 6, "h": 8 },
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "topk(10, sum by (path) (count_over_time({app=~\"$app\"} |= \"audit\" |= \"$requestId\" | json | msgid=\"audit\" | moduleName=~\"$module\" | line_format \"{{.payload}}\" | json status=\"status\", method=\"method\", url=\"url\", duration=\"durationMs\" | label_format path=`{{ regexReplaceAll \"^[a-z]+://[^/]+|[?#].*$\" .url \"\" }}`, family=`{{ regexReplaceAll \"^([1-5])[0-9][0-9]$\" .status \"${1}xx\" }}` [$__range])))",
          "queryType": "instant",
          "instant": true,
          "range": false,
          "legendFormat": "{{path}}"
        }
      ],
      "options": {
        "orientation": "horizontal",
        "displayMode": "gradient",
        "showUnfilled": true,
        "valueMode": "color",
        "namePlacement": "left",
        "text": { "titleSize": 13, "valueSize": 15 },
        "minVizHeight": 14,
        "maxVizHeight": 26,
        "sizing": "manual",
        "reduceOptions": { "calcs": [], "fields": "/^Value/", "values": true }
      },
      "transformations": [
        {
          "id": "sortBy",
          "options": { "sort": [{ "field": "Value #A", "desc": true }] }
        }
      ],
      "fieldConfig": {
        "defaults": {
          "unit": "short",
          "color": { "mode": "continuous-BlPu" },
          "min": 0
        },
        "overrides": []
      }
    },
    {
      "type": "bargauge",
      "title": "Statuts",
      "id": 15,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 18, "y": 20, "w": 6, "h": 8 },
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "sum by (status) (count_over_time({app=~\"$app\"} |= \"audit\" |= \"$requestId\" | json | msgid=\"audit\" | moduleName=~\"$module\" | line_format \"{{.payload}}\" | json status=\"status\", method=\"method\", url=\"url\", duration=\"durationMs\" | label_format path=`{{ regexReplaceAll \"^[a-z]+://[^/]+|[?#].*$\" .url \"\" }}`, family=`{{ regexReplaceAll \"^([1-5])[0-9][0-9]$\" .status \"${1}xx\" }}` [$__range]))",
          "queryType": "instant",
          "instant": true,
          "range": false,
          "legendFormat": "{{status}}"
        }
      ],
      "options": {
        "orientation": "horizontal",
        "displayMode": "gradient",
        "showUnfilled": true,
        "valueMode": "color",
        "namePlacement": "left",
        "text": { "titleSize": 13, "valueSize": 15 },
        "minVizHeight": 14,
        "maxVizHeight": 26,
        "sizing": "manual",
        "reduceOptions": { "calcs": [], "fields": "/^Value/", "values": true }
      },
      "transformations": [
        {
          "id": "sortBy",
          "options": { "sort": [{ "field": "Value #A", "desc": true }] }
        }
      ],
      "fieldConfig": {
        "defaults": {
          "unit": "short",
          "color": { "mode": "continuous-BlPu" },
          "min": 0
        },
        "overrides": []
      }
    },
    {
      "type": "row",
      "title": "Qui écrit",
      "collapsed": false,
      "gridPos": { "x": 0, "y": 28, "w": 24, "h": 1 },
      "id": 16,
      "panels": []
    },
    {
      "type": "bargauge",
      "title": "Modules",
      "id": 17,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 0, "y": 29, "w": 12, "h": 8 },
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "topk(10, sum by (moduleName) (count_over_time({app=~\"$app\"} |= \"$requestId\" |~ \"(?i)$search\" | json | severityName=~\"$severity\" | moduleName=~\"$module\" [$__range])))",
          "queryType": "instant",
          "instant": true,
          "range": false,
          "legendFormat": "{{moduleName}}"
        }
      ],
      "options": {
        "orientation": "horizontal",
        "displayMode": "gradient",
        "showUnfilled": true,
        "valueMode": "color",
        "namePlacement": "left",
        "text": { "titleSize": 13, "valueSize": 15 },
        "minVizHeight": 14,
        "maxVizHeight": 26,
        "sizing": "manual",
        "reduceOptions": { "calcs": [], "fields": "/^Value/", "values": true }
      },
      "transformations": [
        {
          "id": "sortBy",
          "options": { "sort": [{ "field": "Value #A", "desc": true }] }
        }
      ],
      "fieldConfig": {
        "defaults": {
          "unit": "short",
          "color": { "mode": "continuous-BlPu" },
          "min": 0
        },
        "overrides": []
      }
    },
    {
      "type": "bargauge",
      "title": "Catégories (msgid)",
      "id": 18,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 12, "y": 29, "w": 12, "h": 8 },
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "topk(10, sum by (msgid) (count_over_time({app=~\"$app\"} |= \"$requestId\" |~ \"(?i)$search\" | json | severityName=~\"$severity\" | moduleName=~\"$module\" [$__range])))",
          "queryType": "instant",
          "instant": true,
          "range": false,
          "legendFormat": "{{msgid}}"
        }
      ],
      "options": {
        "orientation": "horizontal",
        "displayMode": "gradient",
        "showUnfilled": true,
        "valueMode": "color",
        "namePlacement": "left",
        "text": { "titleSize": 13, "valueSize": 15 },
        "minVizHeight": 14,
        "maxVizHeight": 26,
        "sizing": "manual",
        "reduceOptions": { "calcs": [], "fields": "/^Value/", "values": true }
      },
      "transformations": [
        {
          "id": "sortBy",
          "options": { "sort": [{ "field": "Value #A", "desc": true }] }
        }
      ],
      "fieldConfig": {
        "defaults": {
          "unit": "short",
          "color": { "mode": "continuous-BlPu" },
          "min": 0
        },
        "overrides": []
      }
    },
    {
      "type": "row",
      "title": "Journaux",
      "collapsed": false,
      "gridPos": { "x": 0, "y": 37, "w": 24, "h": 1 },
      "id": 19,
      "panels": []
    },
    {
      "type": "logs",
      "title": "Erreurs et avertissements",
      "id": 20,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 0, "y": 38, "w": 24, "h": 10 },
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "{app=~\"$app\"} |= \"$requestId\" |~ \"(?i)$search\" | json | severityName=~\"$severity\" | moduleName=~\"$module\" | severityName=~\"EMERGENCY|ALERT|CRITIC|ERROR|WARNING\" | regexp `\\\\\"method\\\\\":\\\\\"(?P<m>[A-Z]+)\\\\\",\\\\\"url\\\\\":\\\\\"(?P<u>[^\\\\\"]+)\\\\\",\\\\\"status\\\\\":(?P<st>[0-9]+),\\\\\"durationMs\\\\\":(?P<d>[0-9.]+|null)` | line_format `{{.moduleName}} · {{.msgid}}  {{ if .st }}{{.m}} {{.st}} {{ regexReplaceAll \"^[a-z]+://[^/]+\" .u \"\" }}{{ if ne .d \"null\" }}  {{ printf \"%.5s\" .d }} ms{{ end }}{{ else }}{{.payload}}{{ end }}`",
          "queryType": "range"
        }
      ],
      "options": {
        "showTime": true,
        "showLabels": false,
        "showCommonLabels": false,
        "wrapLogMessage": true,
        "prettifyLogMessage": false,
        "enableLogDetails": true,
        "dedupStrategy": "none",
        "sortOrder": "Descending"
      }
    },
    {
      "type": "logs",
      "title": "Journal",
      "id": 21,
      "datasource": { "type": "loki", "uid": "${datasource}" },
      "gridPos": { "x": 0, "y": 48, "w": 24, "h": 14 },
      "targets": [
        {
          "refId": "A",
          "datasource": { "type": "loki", "uid": "${datasource}" },
          "expr": "{app=~\"$app\"} |= \"$requestId\" |~ \"(?i)$search\" | json | severityName=~\"$severity\" | moduleName=~\"$module\" | regexp `\\\\\"method\\\\\":\\\\\"(?P<m>[A-Z]+)\\\\\",\\\\\"url\\\\\":\\\\\"(?P<u>[^\\\\\"]+)\\\\\",\\\\\"status\\\\\":(?P<st>[0-9]+),\\\\\"durationMs\\\\\":(?P<d>[0-9.]+|null)` | line_format `{{.moduleName}} · {{.msgid}}  {{ if .st }}{{.m}} {{.st}} {{ regexReplaceAll \"^[a-z]+://[^/]+\" .u \"\" }}{{ if ne .d \"null\" }}  {{ printf \"%.5s\" .d }} ms{{ end }}{{ else }}{{.payload}}{{ end }}`",
          "queryType": "range"
        }
      ],
      "options": {
        "showTime": true,
        "showLabels": false,
        "showCommonLabels": false,
        "wrapLogMessage": true,
        "prettifyLogMessage": false,
        "enableLogDetails": true,
        "dedupStrategy": "none",
        "sortOrder": "Descending"
      }
    }
  ]
}
