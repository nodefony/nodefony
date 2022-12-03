class MigrateEntity extends nodefony.Service {

  constructor(entityName, queryInterface, kernel) {
    super("migrate", kernel.container);
    this.entityName = entityName
    this.queryInterface = queryInterface
    this.sequelize = this.queryInterface.sequelize
    this.model = this.getSequelizeModel();
    this.cli = this.kernel.cli
  }

  async initialize(transaction = null) {
    this.transaction = transaction || await this.queryInterface.sequelize.transaction();
    this.tableDefinition = await this.describeTable()
    return this.transaction
  }

  getSequelizeModel(){
    return this.sequelize.model(this.entityName) || null;
  }

  async describeTable(log = false) {
    try {
      const desc = await this.queryInterface.describeTable(this.entityName)
      if (log) {
        this.logDefinition(desc)
      }
      return desc
    } catch (e) {
      return null
    }
  }

  async findAll(log = false) {
    this.log(`List ${this.entityName} ${this.cli.getEmoji("clapper")}`);
    const descriptions = await this.model.findAll()
    if (log) {
      try {
        const head = []
        const details = []
        //const colWidths =[]
        for (let entity of descriptions) {
          let entityTab = []
          let datas = entity.toJSON()
          for (let item in datas) {
            //colWidths.push(8)
            if (!head.includes(item)) {
              head.push(item)
            }
            if (datas[item]) {
              entityTab.push(datas[item].toString())
            } else {
              entityTab.push(datas[item])
            }
          }
          details.push(entityTab)
        }

        let maxWidth = process.stdout.columns || 20;
        if (process.stdout.columns) {
          maxWidth = process.stdout.columns / head.length
        } else {
          maxWidth = 20
        }
        const colWidths = []
        let table = this.cli.displayTable(details, {
          head,
          width: maxWidth,
          colWidths: colWidths,
          wordWrap: true,
          wrapOnWordBoundary: false,
        });
      } catch (e) {
        this.log(e, "ERROR")
      }
    }
    return descriptions
  }

  logDefinition(descriptions) {
    this.log(`Entity ${this.entityName} ${this.cli.getEmoji("clapper")}`);
    const head = ["Column"]
    const details = []
    for (let entity in descriptions) {
      let entityTab = [entity]
      for (let item in descriptions[entity]) {
        if (!head.includes(item)) {
          head.push(item)
        }
        entityTab.push(descriptions[entity][item])
      }
      details.push(entityTab)
    }
    try {
      let table = this.cli.displayTable(details, {
        head
      });
    } catch (e) {
      this.log(e, "ERROR")
    }
  }

  addColumn(cname, options) {
    if (!this.tableDefinition) {
      throw new Error(`No table definition`)
    }
    if (Object.hasOwn(this.tableDefinition, cname)) {
      this.log(`Nothing to do : column ${cname} already exists in ${this.entityName}`);
      return this.model;
    }
    return this.queryInterface.addColumn(
        this.entityName,
        cname,
        options, {
          transaction: this.transaction
        }
      ).then(async () => {
        this.log(`Column ${cname} created`);
        return {
          model: this.model,
          transaction: this.transaction
        };
      })
      .catch((e) => {
        throw e
      })
  }

  removeColumn(cname) {
    if (!this.tableDefinition) {
      throw new Error(`No table definition`)
    }
    if (!Object.hasOwn(this.tableDefinition, cname)) {
      this.log(`Nothing to do : column ${cname} already deleted from ${this.entityName}`);
      return this.model;
    }
    return this.queryInterface.removeColumn(
        this.entityName,
        cname, {
          transaction: this.transaction
        }
      ).then(async () => {
        this.log(`Table ${this.entityName} removeColumn ${cname}`);
        return {
          model: this.model,
          transaction: this.transaction
        };
      })
      .catch((e) => {
        throw e
      })
  }

  dropTable() {
    try {
      return this.queryInterface.dropTable(this.entityName, {
          transaction: this.transaction
        })
        .then(async (result) => {
          this.log(`dropTable ${this.entityName}`);
          return {
            result,
            model: this.model,
            transaction: this.transaction
          };
        })
    } catch (e) {
      throw e
    }
  }

  createTable(definition) {
    try {
      return this.queryInterface.createTable(this.entityName, definition, {
          transaction: this.transaction
        })
        .then(async (result) => {
          this.log(`createTable ${this.entityName}`);
          return {
            result,
            model: this.model,
            transaction: this.transaction
          };
        })
    } catch (e) {
      throw e
    }
  }

  addConstraint(options) {
    try {
      return this.queryInterface.addConstraint(this.entityName, options, {
          transaction: this.transaction
        })
        .then(async (result) => {
          this.log(`addConstraint ${this.entityName}`);
          return {
            result,
            model: this.model,
            transaction: this.transaction
          };
        })
    } catch (e) {
      throw e
    }
  }

  async commit() {
    if (this.transaction) {
      if (!this.transaction.finished) {
        this.log(`Commit transaction on table ${this.entityName}`);
        return await this.transaction.commit();
      }
      this.log("Commit Transaction already finished", "WARNING")
      return this.transaction
    }
    throw new Error("Commit No transaction found")
  }

  async rollback() {
    if (this.transaction) {
      if (!this.transaction.finished) {
        this.log(`Rollback transaction on table ${this.entityName}`);
        return await this.transaction.rollback();
      }
      this.log("Rollback Transaction already finished", "WARNING")
      return this.transaction
    }
    throw new Error("Rollback No transaction found")
  }
}

module.exports = MigrateEntity
