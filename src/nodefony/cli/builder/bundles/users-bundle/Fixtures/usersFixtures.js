const users = require("./users.js");

class usersFixture extends nodefony.Service {

  constructor(container) {
    super("usersFixture", container);
    this.orm = this.kernel.getORM();
    this.ormName = this.orm.name;
    this.entity = this.orm.getEntity("user");
    this.usersService = this.get("users");
  }

  async run() {
    return new Promise((resolve) => {
      if (this.orm.ready) {
        return resolve(this.initialize());
      } else {
        this.orm.once("onOrmReady", () => {
          return resolve(this.initialize());
        });
      }
    });
  }

  async initialize() {
    switch (this.ormName) {
      case 'sequelize':
        return await this.runSequelize();
      case "mongoose":
        return await this.runMongoose();
    }
  }

  async runSequelize() {
    try {
      let tab = [];
      for (let user in users) {
        tab.push(await this.loadSequelizeFixtures(users[user]));
      }
      return tab;
    } catch (e) {
      this.logger(e, "ERROR");
    }
  }

  runMongoose() {
    console.log("runMongoose")
  }

  loadSequelizeFixtures(obj) {
    return this.entity.findOrCreate({
        where: {
          username: obj.username
        },
        defaults: obj
      })
      .then((res) => {
        if (res[1]) {
          this.logger("ADD USER : " + res[0].username, "INFO");
        } else {
          this.logger("ALREADY EXIST USER : " + res[0].username, "INFO");
        }
        return res[1];
      });
  }

}

module.exports = {
  type: "sequelize",
  connection: "nodefony",
  entity: "user",
  fixture: usersFixture
};
