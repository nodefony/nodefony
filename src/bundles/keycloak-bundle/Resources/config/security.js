/**
 *   Firewall Config  service Security
 *
 *   // example cross domain
 *   firewalls   :{
 *      keycloak_area:{
 *        pattern:                    /^\/keycloak/,
 *        crossDomain:{
 *            "allow-origin":           "*",
 *            "Access-Control":{
 *              "Access-Control-Allow-Methods":         "GET, POST, PUT, DELETE, OPTIONS",
 *              "Access-Control-Allow-Credentials":     true,
 *              "Access-Control-Expose-Headers":        "WWW-Authenticate ,X-Json",
 *              "Access-Control-Max-Age":               10
 *            }
 *        }
 *      }
 *    }
 **/
const cors = {
  "allow-origin": "*",
  "Access-Control": {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "nodefony_csrf, jwt, Authorization, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Expose-Headers": "WWW-Authenticate ,X-Json, nodefony_csrf, jwt",
    "Access-Control-Max-Age": 10
  }
};

module.exports = {
  security: {
    firewalls: {
      openidconnectApp: {
        pattern: /^\/nodefony/u,
        stateless: false,
        "passport-openidconnect": {
          issuer: "http://localhost:8080/realms/nodefony",
          // issuer: "https://keycloak.dev.as49028.net/realms/dlake",
          // authorizationURL: "http://localhost:8080/realms/nodefony/protocol/openid-connect/auth",
          // tokenURL: "http://localhost:8080/realms/nodefony/protocol/openid-connect/token",
          // userInfoURL: "http://localhost:8080/realms/nodefony/protocol/openid-connect/userinfo",
          // end_session_endpoint: "http://localhost:8080/realms/nodefony/protocol/openid-connect/logout",
          clientID: "nodefony-frontend",
          clientSecret: "Cyr2QrmtMJSeGg86djFA8hdtdDZ2zsaU",
          // clientID: "portal",
          // clientSecret: "RuNvDZuEfc2cRGkOjfNwOIOUgu0NtDDJ",
          callbackURL: "https://localhost:5152/nodefony/keycloak/callback",
          callbackLogoutURL: "https://localhost:5152/nodefony/keycloak/callback/logout",
          scope: "profile roles email address",
          maxAge: 3600,
          cookieSettings: {
            maxAge: 300,
            path: "/nodefony"
          }
          // passReqToCallback: true
        }
      },

      /* openidconnectApi: {
        pattern: /^\/myapi/u,
        stateless: true,
        "passport-openidconnect": {
          issuer: "http://localhost:8080/realms/nodefony",
          // authorizationURL: "http://localhost:8080/realms/nodefony/protocol/openid-connect/auth",
          // tokenURL: "http://localhost:8080/realms/nodefony/protocol/openid-connect/token",
          // userInfoURL: "http://localhost:8080/realms/nodefony/protocol/openid-connect/userinfo",
          clientID: "nodefony-backend",
          clientSecret: "MJ16dTm4NewfjzLk6Xr0JF3yQttELBDK",
          callbackURL: "https://localhost:5152/myapi/callback",
          scope: "openid profile roles email address phone"
        }
      }*/

      openidconnectApi: {
        pattern: /^\/myapi/u,
        redirectHttps: true,
        stateless: true,
        "passport-jwt": {
          algorithms: "RS256",
          certificats: {
            private: path.resolve("config", "certificates", "ca", "private", "ca.key.pem"),
            public: path.resolve("config", "certificates", "ca", "public", "public.key.pem")
          },
          jwtFromRequest: { // fromCookie or fromHeader
            extractor: "fromHeader",
            params: ["jwt"]
          }
        },
        crossDomain: cors
      }
    }
  }
};
