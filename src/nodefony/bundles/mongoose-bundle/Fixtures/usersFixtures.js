const Mongoose = require("mongoose");
module.exports = nodefony.registerFixture("users", function () {

  const userPromise = function (resolve, reject) {

    const user = this.getEntity("user");

    const tab = [{
      username: "anonymous",
      name: "anonymous",
      surname: "anonymous",
      password: "anonymous",
      email: "anonymous@nodefony.com",
      lang: "en_en",
      roles: ["ROLE_ANONYMOUS"]
    }, {
      username: "admin",
      name: "administrator",
      surname: "nodefony",
      password: "admin",
      email: "administrator@nodefony.com",
      roles: ["ROLE_ADMIN"]
    }, {
      username: "1000",
      name: "Michael",
      surname: "Corleone",
      password: "1234",
      lang: "fr_fr",
      email: "michael@nodefony.com",
      gender: "male",
      roles: ["ROLE_ADMIN", "ROLE_USER"]
    }, {
      username: "2000",
      name: "Vito",
      surname: "Corleone",
      password: "1234",
      lang: "fr_fr",
      email: "vito@nodefony.com",
      gender: "male",
      roles: ["ROLE_USER"]
    }, {
      username: "3000",
      name: "Connie",
      surname: "Corleone",
      password: "1234",
      email: "connie@nodefony.com",
      gender: "female",
      lang: "fr_fr",
      roles: ["ROLE_USER"]
    }];

    //const connection = this.getConnection("nodefony");
    return user.insertMany(tab)
      .then((ele) => {
        return resolve(ele);
      }).catch((e) => {
        return reject(e);
      });

  };

  return {
    type: "mongoose",
    connection: "nodefony",
    entity: "user",
    fixture: userPromise
  };
});