import SwaggerUI from 'swagger-ui';
import { SwaggerUIBundle, SwaggerUIStandalonePreset } from "swagger-ui-dist";
// or use require, if you prefer
//const SwaggerUI = require('swagger-ui');
import "swagger-ui/dist/swagger-ui.css";

SwaggerUI({
  //url: "/users/api/documentation?config=true",
  urls: [{
    url: "/api/users/documentation",
    name: "users"
  }, {
    url: "/api/jwt/documentation",
    name: "login"
  }],
  dom_id: '#swagger',
  //defaultModelsExpandDepth: -1,
  deepLinking: true,
  presets: [
    SwaggerUI.presets.apis,
    SwaggerUIStandalonePreset
  ],
  plugins: [
    SwaggerUIBundle.plugins.DownloadUrl
  ],
  layout: "StandaloneLayout",
  requestInterceptor: function(request) {
    //console.log('[Swagger] intercept try-it-out request');
    //request.headers.jwt = localstorage;
    return request;
  }
});
