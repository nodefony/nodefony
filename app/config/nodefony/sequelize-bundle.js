/**
 *  OVERRIDE ORM SEQUELIZE BUNDLE
 *
 *       @see SEQUELIZE BUNDLE config for more options
 *       @more options http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html
 *
 *       Nodefony Database Management
 *        dialect :               'mysql'|'sqlite'|'postgres'|'mssql'
 *
 *       By default nodefony create  connector name nodefony ( driver sqlite )
 *       for manage Sessions / Users
 *
 *       For mysql/mariadb create database nodefony before :
 *
 *       $ nodefony sequelize:create:database [force]  => Create database
 *
 *       Synchronize entities :
 *       $ nodefony sequelize:sync [force]    => Create tables index ...
 *
 *       Here create new databases connectors
 *       and use for sync connectors :
 *       nodefony sequelize:sync
 *
 *        connectors: {
 *         nodefony: {
 *           driver: "mysql",
 *           dbname: 'nodefony',
 *           username: 'nodefony',
 *           password: 'nodefony',
 *           options: {
 *             dialect: "mysql",
 *             host: "localhost",
 *             port: "3306",
 *             pool:{
 *               max:   5,
 *               min:   0,
 *               idle:  10000,
 *               acquire:60000
 *             }
 *           }
 *         }
 *
 */
const vault = () => {
  return () => {
    return new Promise(async (resolve, reject) => {
      try {
        serviceVault = kernel.get("vault");
        const token = await serviceVault.getConnectorCredentials("nodefony")
        return resolve(token.data)
      } catch (e) {
        return reject(e)
      }
    })
  }
}

module.exports = {
  debug: false,
  strategy: "migrate", // sync || migrate || none  when nodefony build  or  nodefony install
  connectors: {
    // nodefony: {
    //   driver: "mysql",
    //   dbname: 'nodefony',
    //   username: 'root',
    //   password: 'nodefony',
    //   options: {
    //     dialect: "mysql",
    //     host: "localhost",
    //     port: "3306",
    //     pool: {
    //       max: 5,
    //       min: 0,
    //       idle: 10000,
    //       acquire: 60000
    //     }
    //   }
    // },
    // nodefony: {
    //   driver: "postgres",
    //   dbname: 'nodefony',
    //   username: 'postgres',
    //   password: 'postgrespw',
    //   credentials: vault(),
    //   options: {
    //     dialect: "postgres",
    //     host: "localhost",
    //     port: "5432",
    //     pool: {
    //       max: 30,
    //       min: 0,
    //       idle: 10000,
    //       acquire: 60000
    //     }
    //   }
    // }
  }
}
