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
        scheme: "bearer",
        in: "header", // can be "header", "query" or "cookie"
        name: "jwt" // name of the header, query parameter or cookie
      }
    },
    schemas: {
      Error: {
        description: "Api Error",
        content: {
          "application/json": {
            schema: {

            }
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: "API key is missing or invalid",
        headers: {
          jwt: {
            schema: {
              type: "string"
            }
          }
        }
      },
      '401': {
        $ref: "#/components/responses/UnauthorizedError"
      },
      default: {
        description: "unexpected error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error"
            }
          }
        }
      }
    }
  },
  paths: {
    "/api/users": {
      options: {
        summary: "Get openapi3 config",
        tags: ["users"],
        parameters: [{
          name: "limit",
          in: "query",
          description: "How many items to return at one time (max 100)",
          required: false,
          schema: {
            type: "integer",
            format: "int32"
          }
        }],
        responses: {
          '200': {
            description: "A paged array of users",
            content: {
              "application/json": {
                schema: {
                  //$ref: "#/components/schemas/users"
                }
              }
            }
          }
        }
      },
      get: {
        summary: "List all users",
        tags: ["users"],
        security: [{
          jwtAuth: ""
        }],
        responses: {
          '200': {
            description: "get headers request"
          },

        }
      },
      post: {
        summary: "List all users",
        tags: ["users"],
        security: [{
          jwtAuth: ""
        }],
        responses: {
          '200': {
            description: "get headers request"
          }
        }
      },
      head: {
        summary: "List all users",
        tags: ["users"],
        security: [{
          jwtAuth: ""
        }],
        responses: {
          '200': {
            description: "get headers request"
          }
        }
      },
      trace: {
        summary: "List all users",
        tags: ["users"],
        security: [{
          jwtAuth: ""
        }],
        responses: {
          '200': {
            description: "get headers request"
          }
        }
      }
    },
  },

  tags: [{
    name: "users",
    description: "Users operations"
  }, {
    name: "jwt",
    description: "JWT Authentication"
  }]

};

module.exports = openapi;
