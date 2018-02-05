const Sequelize = require("sequelize");

const schema = {
  session_id: {
    type: Sequelize.STRING(126).BINARY,
    primaryKey: true
  },
  context: {
    type: Sequelize.STRING(126).BINARY,
    defaultValue: "default",
    primaryKey: true
  },
  Attributes: {
    type: Sequelize.TEXT,
    set: function (value) {
      return this.setDataValue('Attributes', JSON.stringify(value));
    },
    get: function (value) {
      var val = this.getDataValue(value);
      return JSON.parse(val);
    }
  },
  flashBag: {
    type: Sequelize.TEXT,
    set: function (value) {
      return this.setDataValue('flashBag', JSON.stringify(value));
    },
    get: function (value) {
      let val = this.getDataValue(value);
      return JSON.parse(val);
    }
  },
  metaBag: {
    type: Sequelize.TEXT,
    set: function (value) {
      return this.setDataValue('metaBag', JSON.stringify(value));
    },
    get: function (value) {
      let val = this.getDataValue(value);
      return JSON.parse(val);
    }
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
};

module.exports = class session extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "session", "sequelize", "nodefony");

    this.orm.on("onOrmReady", ( /*orm*/ ) => {
      let user = this.orm.getEntity("user");
      if (user) {
        this.model.belongsTo(user, {
          foreignKey: 'user_id',
          constraints: false
        });
      } else {
        throw new Error("ENTITY ASSOCIATION user NOT AVAILABLE");
      }
    });
  }

  registerModel(db) {
    let model = db.define(this.name, schema, {
      logging: false
    });

    model.fetchAll = function (callback) {
      return this.findAll().then(function (result) {
        return callback(null, result);
      }).catch(function (error) {
        if (error) {
          return callback(error, null);
        }
      });
    };

    return model;
  }
};