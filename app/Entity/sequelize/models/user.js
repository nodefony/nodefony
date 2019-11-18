'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING(126),
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(256),
      set(value) {
        let encoded = encodePassword(value);
        return this.setDataValue("password", encoded);
      }
    },
    "2fa": {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    "2fa-token": {
      type: DataTypes.STRING(256),
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    userNonExpired: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    credentialsNonExpired: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    accountNonLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    email: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    lang: {
      type: DataTypes.STRING,
      defaultValue: "en_en"
    },
    roles: {
      type: DataTypes.JSON,
      defaultValue: [],
      get(key) {
        let val = this.getDataValue(key);
        if (typeof (val) === "string") {
          val = JSON.parse(val);
        }
        return val;
      }
    },
    gender: {
      type: DataTypes.STRING,
      defaultValue: "none"
    },
    url: DataTypes.STRING,
    image: DataTypes.STRING
  }, {});
  User.associate = function (models) {
    // associations can be defined here
  };
  return User;
};