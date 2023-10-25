/**
 *  NODEFONY FRAMEWORK
 *
 *       KERNEL CONFIG
 *
 *   Domain listen : Nodefony can listen only one domain ( no vhost )
 *     Example :
 *      domain :  0.0.0.0      // for all interfaces
 *      domain :  [::1]        // for IPV6 only
 *      domain :  192.168.1.1  // IPV4
 *      domain :  mydomain.com // DNS
 *
 *   Domain Alias : string only "<<regexp>>" use domainCheck : true
 *     Example :
 *      domainAlias:[
 *        "^127.0.0.1$",
 *        "^localhost$",
 *        ".*\\.nodefony\\.com",
 *        "^nodefony\\.eu$",
 *        "^.*\\.nodefony\\.eu$"
 *      ]
 */
const path = require("path");

const certificats = {
  options: {
    rejectUnauthorized: true
  }
};
let CDN = null;
let statics = true;
let monitoring = true;
let documentation = true;
let unitTest = true;
let domainCheck = false;

switch (kernel.appEnvironment) {
  case "production":
  case "development":
  default:
    certificats.key = path.resolve("config", "certificates", "server", "privkey.pem");
    certificats.cert = path.resolve("config", "certificates", "server", "fullchain.pem");
    certificats.ca = path.resolve("config", "certificates", "ca", "nodefony-root-ca.crt.pem");
    CDN = null;
    statics = true;
    documentation = true;
    monitoring = true;
    unitTest = true;
    domainCheck = true;
}

module.exports = {
  system: {
    domain: "0.0.0.0",
    domainAlias: [
      "^127.0.0.1$",
      "^localhost$"
    ],
    httpPort: 5151,
    httpsPort: 5152,
    domainCheck,
    locale: "en_en",

    /**
     * BUNDLES CORE
     */
    security: true,
    realtime: true,
    monitoring,
    mail: true,
    documentation,
    unitTest,
    redis: false,
    mongo: false,
    elastic: false,

    /**
     * SERVERS
     */
    servers: {
      statics,
      protocol: "2.0", //  2.0 || 1.1
      http: true,
      https: true,
      ws: true,
      wss: true,
      certificats
    },

    /**
     * DEV SERVER
     */
    devServer: {
      hot: false, // true  || only || false
      overlay: true,
      logging: "info", // none, error, warning or info
      progress: false,
      protocol: "https",
      websocket: true
    },

    /**
     *  BUNDLES LOCAL REGISTRATION
     *
     *       bundles:{
     *         "hello-bundle" : "file:src/bundles/hello-bundle"
     *         "test-bundle"  : path.resolve("src", "bundles", "test-bundle")
     *       }
     */
    bundles: {
      "test-bundle": path.resolve("src", "bundles", "test-bundle"),
      "users-bundle": path.resolve("src", "nodefony", "cli", "builder", "bundles", "users-bundle")
      // "demo-bundle": "file:src/bundles/demo-bundle",
      // "webAssembly-bundle": "file:src/bundles/webAssembly-bundle",
      // "ia-bundle": "file:src/bundles/ia-bundle",
      // "vault-bundle": "file:src/bundles/vault-bundle"
      // "keycloak-bundle": "file:src/bundles/keycloak-bundle"
    },

    /**
     * SYSLOG NODEFONY
     */
    log: {
      active: true,
      debug: "*" // ["WEBPACK","ROUTER","bundle-sequelize"]
    }
  },

  /**
   *       ASSETS CDN
   *
   *       You set cdn with string
   *       CDN :    "cdn.nodefony.com",
   *       or
   *       CDN:
   *          global: "cdn.nodefony.com",
   *       or
   *       CDN:{
   *         stylesheet:[
   *           "cdn.nodefony.com"
   *         ],
   *         javascript:[
   *           "cdn.nodefony.com"
   *         ],
   *         image:[
   *           "cdn.nodefony.com",
   *           "cdn.nodefony.fr"
   *         ],
   *         font:[
   *           "cdn.nodefony.com"
   *         ]
   *      },
   */
  CDN,

  /**
   *  ENGINE TEMPLATE
   *
   *       TWIG
   *       https://github.com/justjohn/twig.js
   *
   */
  templating: "twig",

  /**
   * ENGINE ORM
   *       sequelize || mongoose
   *   orm : mongoose
   */
  orm: "sequelize",

  /**
   * NODE.JS PACKAGE MANAGER
   *
   *       npm
   *       yarn
   *       pnpm
   */
  packageManager: "yarn"

};
