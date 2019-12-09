import SwaggerUI from 'swagger-ui';
// or use require, if you prefer
//const SwaggerUI = require('swagger-ui');
import "swagger-ui/dist/swagger-ui.css";

SwaggerUI({
  dom_id: '#swagger',
  url: "/users/api/documentation?config=true",
  requestInterceptor:function (request) {
    return request;
  }
  /*urls: [{
    url: "https://localhost:5152/test/swagger?api=users",
    name: "user1"
  }, {
    url: "https://localhost:5152/test/swagger?api=users",
    name: "user2"
  }]*/
});
