// migrations/00_initial.js
const {
  Sequelize,
  DataTypes,
  Model
} = require('sequelize');

//tools

class MigrateUSer extends nodefony.Service {
  constructor(kernel) {
    super("MigrateUSer", kernel.container);
    this.serviceUmzug = this.get("umzug");
    //this.orm = this.kernel.getOrm();
  }

  async up({
    context: queryInterface
  }) {
    this.log("Migrate up for user table");
    let migrateUser = null;
    let transaction = null;
    try {
      migrateUser = this.serviceUmzug.createMigrateEntity("user", queryInterface, this.kernel);
      transaction = await migrateUser.initialize();
    } catch (e) {
      this.log(e, "ERROR")
      throw e
    }
    // addColumn
    return migrateUser.addColumn('token', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "1234"
      })
      .then(async ({
        model,
        transaction
      }) => {
        this.log("Migrate upgrade data for user table");
        try {
          await migrateUser.findAll(true)
        } catch (e) {
          console.log(e)
        }
        let users = await model.findAll();
        users.map(async (user) => {
          // change data
          this.log(`Update token for user : ${user.username}`);
          /*await user.update({
          }).then((updatedRecord) => {
            this.log(`Update token for user : ${updatedRecord.username}`);
          })*/
        })
        await migrateUser.commit()
        await migrateUser.describeTable(true)
        return model
      })
      .catch(async e => {
        await migrateUser.rollback();
        throw e
      })
  }

  async down({
    context: queryInterface
  }) {
    this.log("Migrate Reverting for user table");
    let migrateUser = null;
    let transaction = null;
    try {
      migrateUser = this.serviceUmzug.createMigrateEntity("user", queryInterface, this.kernel);
      transaction = await migrateUser.initialize();
    } catch (e) {
      this.log(e, "ERROR")
      throw e
    }

    // addColumn
    return migrateUser.removeColumn('token')
      .then(async ({
        model,
        transaction
      }) => {
        this.log("Migrate upgrade data for user table");
        try {
          await migrateUser.findAll(true)
        } catch (e) {
          console.log(e)
        }
        let users = await model.findAll();
        users.map(async (user) => {
          this.log(`Update user when migrate down : ${user.username}`);
        });
        await migrateUser.commit()
        await migrateUser.describeTable(true)
        return model
      })
      .catch(async (e) => {
        await migrateUser.rollback();
        throw e
      })

  }
}

module.exports = new MigrateUSer(kernel);
