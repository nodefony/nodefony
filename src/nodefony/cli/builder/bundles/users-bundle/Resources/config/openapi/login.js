/**
GET
La méthode GET demande une représentation de la ressource spécifiée. Les requêtes GET doivent uniquement être utilisées afin de récupérer des données.

HEAD
La méthode HEAD demande une réponse identique à une requête GET pour laquelle on aura omis le corps de la réponse (on a uniquement l'en-tête).

POST
La méthode POST est utilisée pour envoyer une entité vers la ressource indiquée. Cela  entraîne généralement un changement d'état ou des effets de bord sur le serveur.

PUT
La méthode PUT remplace toutes les représentations actuelles de la ressource visée par le contenu de la requête.

DELETE
La méthode DELETE supprime la ressource indiquée.

CONNECT
La méthode CONNECT établit un tunnel vers le serveur identifié par la ressource cible.

OPTIONS
La méthode OPTIONS est utilisée pour décrire les options de communications avec la ressource visée.

TRACE
La méthode TRACE réalise un message de test aller/retour en suivant le chemin de la ressource visée.

PATCH
La méthode PATCH est utilisée pour appliquer des modifications partielles à une ressource.

200 (OK)
201 (Created)
202 (Accepted)
204 (No Content)

301 (Moved Permanently)
302 (Found)
303 (See Other)
304 (Not Modified)
307 (Temporary Redirect)

400 (Bad Request)
401 (Unauthorized)
403 (Forbidden)
404 (Not Found)
405 (Method Not Allowed)
406 (Not Acceptable)
412 (Precondition Failed)
415 (Unsupported Media Type)
500 (Internal Server Error)
501 (Not Implemented)

**/

const openapi = {
  openapi: "3.0.2",
  components: {
    securitySchemes: {
      jwtAuth: { // arbitrary name for the security scheme
        type: "apiKey",
        in: "header", // can be "header", "query" or "cookie"
        name: "jwt" // name of the header, query parameter or cookie
      }
    },
    schemas: {
      jwt: {
        type: "object",
        properties:{
          token:{
            type: "string"
          },
          refreshToken:{
            type: "string"
          },
          decodedToken:{
            type: "object"
          }
        },
        example: `{
"decodedToken": {
      "data": {
        "name": "userPassword",
        "roles": [
          {
            "role": "ROLE_ADMIN"
          }
        ],
        "user": {
          "username": "admin",
          "name": "administrator",
          "surname": "nodefony",
          "roles": [
            "ROLE_ADMIN"
          ],
          "lang": "en_en",
          "enabled": true,
          "accountNonExpired": true,
          "credentialsNonExpired": true,
          "accountNonLocked": true
        },
        "authenticated": true,
        "factory": "local",
        "provider": "nodefony"
      },
      "iat": 1576074663,
      "exp": 1576075563
    },
"token": ".....",
"refreshToken":"......"
  }
        `
      }
    },
    responses: {

    }
  },
  paths: {
    "/api/jwt": {
      options: {
        summary: "Get OpenAPI (OAS 3.0) configuration",
        tags: ["JWT CONFIGURATION"],
        responses: {
          '200': {
            description: "A paged array of users"
          },
          default: {
            $ref: "#/components/responses/default"
          }
        }
      },
    },
    "/api/jwt/login": {
      post: {
        summary: "Authnticate user with credentials",
        tags: ["JWT AUTHENTICATION"],
        parameters: [{
          name: "username",
          description: "User name",
          in: "query",
          required: true
        }, {
          name: "passwd",
          description: "User password",
          in: "query",
          required: true
        }],
        responses: {
          '200': {
            description: "get Authentication tokens",
            content: {
              "application/json": {
                schema: {
                  allOf: [{
                    $ref:"#/components/schemas/jwt-api-login"
                  },{
                    type:"object",
                    properties:{
                      result: {
                        $ref:"#/components/schemas/jwt"
                      },
                    }
                  }]
                },
                example: `{
  "api": "jwt-api-login",
  "version": "1.0.0",
  "result": {
    "decodedToken": {
      "data": {
        "name": "userPassword",
        "roles": [
          {
            "role": "ROLE_ADMIN"
          }
        ],
        "user": {
          "username": "admin",
          "name": "administrator",
          "surname": "nodefony",
          "roles": [
            "ROLE_ADMIN"
          ],
          "lang": "en_en",
          "enabled": true,
          "accountNonExpired": true,
          "credentialsNonExpired": true,
          "accountNonLocked": true
        },
        "authenticated": true,
        "factory": "local",
        "provider": "nodefony"
      },
      "iat": 1576074663,
      "exp": 1576075563
    },
    "token": "....",
    "refreshToken":"...."
  },
  "message": "OK",
  "messageId": null,
  "error": null,
  "errorCode": null,
  "errorType": null,
  "debug": false,
  "url": "https://0.0.0.0:5152/api/jwt/login?username=admin&passwd=admin",
  "method": "POST",
  "scheme": "https",
  "severity": "INFO",
  "code": 200
}
                `
              }
            }
          },
          default: {
            $ref: "#/components/responses/default"
          }
        }
      }
    },
    "/api/jwt/token": {
      post: {
        summary: "Regenerate token with refreshToken",
        tags: ["JWT AUTHENTICATION"],
        parameters: [{
          name: "refreshToken",
          description: "Authentication refreshToken",
          in: "header",
          required: true
        }],
        responses: {
          '200': {
            description: "Regenerated Token"
          },
          default: {
            $ref: "#/components/responses/default"
          }
        }
      }
    },
    "/api/jwt/logout": {
      post: {
        summary: "logout user",
        tags: ["JWT AUTHENTICATION"],
        parameters: [{
          name: "token",
          description: "Authentication token",
          in: "header",
          required: true
        }],
        responses: {
          '200': {
            description: "logout user"
          },
          default: {
            $ref: "#/components/responses/default"
          }
        },
        security: [{
          jwtAuth: ""
        }],
      }
    },
  },
  tags: [{
    name: "JWT AUTHENTICATION",
    description: "JWT Authentication and refresh"
  }, {
    name: "JWT CONFIGURATION",
    description: "JWT API configuration"
  }]
};

module.exports = openapi;
