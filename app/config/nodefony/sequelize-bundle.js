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
 *       Strategy  sync or migrate Create Structure Database
 *
 *       Strategy sync
 *       $ nodefony sequelize:sync      => Create Structure tables from Entity
 *
 *       Strategy  migrate
 *        $ nodefony sequelize:migrate   => Create Structure tables from migrate files
 *
 *
 *    connectors: {
 *        nodefony: {
 *           driver: "mysql",
 *           dbname: 'nodefony',
 *           username: 'nodefony',
 *           password: 'nodefony',
 *           credentials: vault,
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
 *        },
 *        myconnector:{
 *          dbname: 'nodefony',
 *          username: 'postgres',
 *          password: 'nodefony',
 *          options: {
 *            dialect: "postgres",
 *            host: "localhost",
 *            port: "5432",
 *            pool: {
 *              max: 30,
 *              min: 0,
 *              idle: 10000,
 *              acquire: 60000
 *            },
 *            retry: {
 *              match: [
 *                Sequelize.ConnectionError,
 *                Sequelize.ConnectionTimedOutError,
 *                Sequelize.ConnectionRefusedError,
 *                Sequelize.TimeoutError,
 *                /Deadlock/i
 *              ],
 *              max: Infinit
 *            }
 *          }
 *        }
 */
 let Transaction , Sequelize
 if (nodefony.Sequelize){
   Transaction = nodefony.Sequelize.Transaction
   Sequelize = nodefony.Sequelize.Sequelize
 }

const vault = async () => {
  const serviceVault = kernel.get("vault");
  return await serviceVault.getConnectorCredentials("nodefony")
}

const connectors = {}
switch (kernel.appEnvironment.environment) {
  case "production":
  case "container":
  case "development":
  default:
    connectors.nodefony = {
      driver: 'sqlite',
      dbname: path.resolve("app", "Resources", "databases", "nodefony.db"),
      // credentials: vault,
      options: {
        dialect: "sqlite",
        //isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        retry: {
          match: [
            //Sequelize.ConnectionError,
            //Sequelize.ConnectionTimedOutError,
            //Sequelize.TimeoutError,
            ///Deadlock/i,
            //'SQLITE_BUSY'
          ],
          max: Infinity
        },
        pool: {
          max: 5,
          min: 0,
          idle: 10000
        }
      }
      // dbname: 'nodefony',
      // username: 'postgres',
      // password: 'nodefony',
      // // credentials: vault,
      // options: {
      //   dialect: "postgres",
      //   host: "localhost",
      //   port: "5432",
      //   pool: {
      //     max: 30,
      //     min: 0,
      //     idle: 10000,
      //     acquire: 60000
      //   },
      //   retry: {
      //     match: [
      //       Sequelize.ConnectionError,
      //       Sequelize.ConnectionTimedOutError,
      //       Sequelize.ConnectionRefusedError,
      //       Sequelize.TimeoutError,
      //       /Deadlock/i
      //     ],
      //     max: Infinity
      //   }
      // }

    }
}

module.exports = {
  debug: false,
  strategy: "migrate", // sync || migrate || none  when nodefony build  or  nodefony install
  connectors: connectors
}
