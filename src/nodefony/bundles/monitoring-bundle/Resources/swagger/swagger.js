import SwaggerUI from 'swagger-ui';
import {
  SwaggerUIBundle,
  SwaggerUIStandalonePreset
} from "swagger-ui-dist";

import "swagger-ui/dist/swagger-ui.css";
import "./swagger.css";

const configSwagger = process.env.SWAGGER;

class Swagger {
  constructor() {
    this.config = configSwagger;
    this.initialize();
    this.changeLogo();
  }

  changeLogo() {
    window.addEventListener("load", () => {
      setTimeout(() => {
        // Section 01 - Set url link
        const logo = document.getElementsByClassName('link');
        logo[0].href = "/";
        logo[0].target = "_blank";
        // Section 02 - Set logo
        logo[0].children[0].alt = this.config.projectName;
        logo[0].children[0].src = this.config.logo;

        const newDiv = document.createElement("div");
        const newContent = document.createTextNode('Nodefony Api');
        newDiv.appendChild(newContent);
        logo[0].append(newDiv)

      });
    });
  }

  initialize() {
    //{"jwtAuth":{"name":"jwtAuth","schema":{"type":"apiKey","scheme":"bearer","in":"header","name":"jwt"},"value":"sdqfqsdfqsdf"}}
    const authorized = localStorage.getItem('authorized');
    const token = localStorage.getItem('token');
    if (token) {
      try {
        let autorise = null
        if (authorized) {
          autorise = JSON.parse(authorized)
          autorise.jwtAuth.value = token
      } else {
        autorise = {
          jwtAuth:{
            "name": "jwtAuth",
            "schema": {
              "type": "apiKey",
              "scheme": "bearer",
              "in": "header",
              "name": "jwt"
            },
            "value":`${token}`
          }
        }
      }
      localStorage.setItem('authorized', JSON.stringify(autorise));
    } catch (e) {
      console.log('no token', e)
    }
  }


  this.swagger = SwaggerUI({
    //url: "/api/users/documentation",
    urls: this.config.urls,
    "urls.primaryName": this.config.primaryName,
    dom_id: '#swagger',
    validatorUrl: "none",
    defaultModelsExpandDepth: -1,
    deepLinking: true,
    withCredentials:true,
    presets: [
      SwaggerUI.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      //SwaggerUIBundle.plugins.DownloadUrl
    ],
    persistAuthorization: true,
    layout: "StandaloneLayout",
    requestInterceptor: function(request) {
      //console.log('[Swagger] intercept try-it-out request');
      //request.headers.jwt = localstorage;
      return request;
    }
  });
}
}

export default new Swagger();
