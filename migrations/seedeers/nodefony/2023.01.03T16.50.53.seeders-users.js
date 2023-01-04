const {
  //Sequelize,
  //DataTypes,
  //Model,
  Op
} = nodefony.Sequelize;

const path = require('node:path');

const users = [{
  username: "anonymous",
  name: "anonymous",
  surname: "anonymous",
  password: "anonymous",
  email: "anonymous@nodefony.com",
  "2fa": false,
  "2fa-token": "",
  enabled: true,
  userNonExpired: true,
  credentialsNonExpired: true,
  accountNonLocked: true,
  url: null,
  image: "",
  lang: "en_en",
  gender: "none",
  roles: ["ROLE_ANONYMOUS"]
}, {
  username: "admin",
  name: "administrator",
  surname: "nodefony",
  password: "admin",
  email: "administrator@nodefony.com",
  "2fa": false,
  "2fa-token": "",
  enabled: true,
  userNonExpired: true,
  credentialsNonExpired: true,
  accountNonLocked: true,
  url: null,
  image: "",
  lang: "en_en",
  gender: "none",
  roles: ["ROLE_ADMIN", "ROLE_DEV"]
}, {
  username: "1000",
  name: "Michael",
  surname: "Corleone",
  password: "1234",
  email: "michael@nodefony.com",
  "2fa": false,
  "2fa-token": "",
  enabled: true,
  userNonExpired: true,
  credentialsNonExpired: true,
  accountNonLocked: true,
  url: null,
  image: "",
  lang: "fr_fr",
  gender: "male",
  roles: ["ROLE_ADMIN"]
}, {
  username: "2000",
  name: "Vito",
  surname: "Corleone",
  password: "1234",
  email: "vito@nodefony.com",
  "2fa": false,
  "2fa-token": "",
  enabled: true,
  userNonExpired: true,
  credentialsNonExpired: true,
  accountNonLocked: true,
  url: null,
  image: "",
  lang: "fr_fr",
  gender: "male",
  roles: ["ROLE_USER"]
}, {
  username: "3000",
  name: "Connie",
  surname: "Corleone",
  password: "1234",
  email: "connie@nodefony.com",
  "2fa": false,
  "2fa-token": "",
  enabled: true,
  userNonExpired: true,
  credentialsNonExpired: true,
  accountNonLocked: true,
  url: null,
  image: "",
  gender: "female",
  lang: "fr_fr",
  roles: ["ROLE_USER"]
}];

class Seedeers extends nodefony.Service {
  constructor(kernel) {
    super(path.basename(__filename), kernel.container);
  }

  async up({
    context: queryInterface
  }) {
    return await queryInterface.describeTable("user")
      .then(async (tableDefinition) => {
        const date = new Date()
        const datas = users.map((user) => {
          user.createdAt = date
          user.updatedAt = date
          user.roles = JSON.stringify(user.roles)
          return user
        })
        return await queryInterface.bulkInsert("user", datas)
          .then((nb) => {
            this.log(`Add ${nb} seeds`)
            return datas
          })
          .catch(e => {
            throw e
          })
      })
      .catch(e => {
        throw e
      })
  }

  async down({
    context: queryInterface
  }) {

    return await queryInterface.describeTable("user")
      .then(async (tableDefinition) => {
        const datas = users.map((user) => {
          return user.username
        })
        this.log(datas, "INFO", "DELETE SEEDS")
        return await queryInterface.bulkDelete("user", {
            username: {
              [Op.in]: datas
            }
          })
          .then((res) => {
            return res
          })
          .catch(e => {
            throw e
          })
      })
      .catch(e => {
        throw e
      })
  }
}

module.exports = new Seedeers(kernel);
