const path = require("path");
const fs = require("fs");
module.exports = {
  http:{
    hostname:'127.0.0.1',
    port:3000
  },
  https:{
    hostname:'127.0.0.1',
    port:3443,
    certificates:{
      key : fs.readFileSync(path.resolve("config", "certificates", "server", "privkey.pem")),
      cert : fs.readFileSync(path.resolve("config", "certificates", "server", "fullchain.pem")),
      ca : fs.readFileSync(path.resolve("config", "certificates", "ca", "{{name}}-root-ca.crt.pem"))
    }
  },
  socketio:{

  },
  markdown:{
    html: true
  },
  examples:{
    http:{
      hostname:'127.0.0.1',
      port:3001
    },
  }
};
