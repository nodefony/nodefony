import SwaggerUI from 'swagger-ui';
// or use require, if you prefer
//const SwaggerUI = require('swagger-ui');
import "swagger-ui/dist/swagger-ui.css";

SwaggerUI({
  dom_id: '#swagger',
  url: "https://localhost:5152/test/swagger?api=users",
  /*urls: [{
    url: "https://localhost:5152/test/swagger?api=users",
    name: "user1"
  }, {
    url: "https://localhost:5152/test/swagger?api=users",
    name: "user2"
  }]*/
});