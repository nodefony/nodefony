const Mongoose = require("mongoose");
module.exports = nodefony.registerFixture("users", function () {

  const userPromise = function (resolve, reject) {

    const user = this.getEntity("user");

    const tab = [{
      username: "anonymous",
      name: "anonymous",
      surname: "anonymous",
      displayName: "Anonymous",
      password: user.generatePassword(),
      lang: "en_en",
      roles: "ROLE_ANONYMOUS"
    }, {
      username: "admin",
      name: "administrator",
      surname: "nodefony",
      displayName: "administrator",
      password: "admin",
      roles: "ROLE_ADMIN"
    }, {
      username: "1000",
      name: "User",
      surname: "1000",
      displayName: "1000",
      password: "1234",
      lang: "fr_fr",
      roles: "ROLE_USER"
    }, {
      username: "2000",
      name: "User",
      surname: "2000",
      displayName: "2000",
      password: "1234",
      lang: "fr_fr",
      roles: "ROLE_USER"
    }, {
      username: "3000",
      name: "User",
      surname: "3000",
      displayName: "3000",
      password: "1234",
      lang: "fr_fr",
      roles: "ROLE_USER"
    }];

    //const connection = this.getConnection("nodefony");
    return user.insertMany(tab).then(() => {
      return resolve("userEntity");
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