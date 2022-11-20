class MigrateEntity extends nodefony.Service {

  constructor(entiyName, queryInterface, kernel) {
    super("migrate", kernel.container);
    this.entiyName = entiyName
    this.queryInterface = queryInterface
    this.sequelize = this.queryInterface.sequelize
    this.model = this.sequelize.model(this.entiyName);
    this.cli = this.kernel.cli
  }

  async initialize(transaction = null) {
    this.transaction = transaction || await this.queryInterface.sequelize.transaction();
    this.tableDefinition = await this.describeTable()
    return this.transaction
  }

  async describeTable(log = false) {
    const desc = await this.queryInterface.describeTable(this.entiyName)
    if (log) {
      this.logDefinition(desc)
    }
    return desc
  }

  async findAll(log = false) {
    this.log(`List ${this.entiyName} ${this.cli.getEmoji("clapper")}`);
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
            if( datas[item]){
              entityTab.push(datas[item].toString())
            }else{
              entityTab.push(datas[item])
            }
          }
          details.push(entityTab)
        }

        let maxWidth = process.stdout.columns || 20;
        if(process.stdout.columns){
          maxWidth= process.stdout.columns / head.length
        }else{
          maxWidth = 20
        }
        const colWidths =[]
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
    this.log(`Entity ${this.entiyName} ${this.cli.getEmoji("clapper")}`);
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
    if (Object.hasOwn(this.tableDefinition, cname)) {
      this.log(`Nothing to do : column ${cname} already exists in ${this.entiyName}`);
      return this.model;
    }
    return this.queryInterface.addColumn(
        this.entiyName,
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
    if (!Object.hasOwn(this.tableDefinition, cname)) {
      this.log(`Nothing to do : column ${cname} already deleted from ${this.entiyName}`);
      return this.model;
    }
    return this.queryInterface.removeColumn(
        this.entiyName,
        cname, {
          transaction: this.transaction
        }
      ).then(async () => {
        this.log(`Table ${this.entiyName} removeColumn ${cname}`);
        return {
          model: this.model,
          transaction: this.transaction
        };
      })
      .catch((e) => {
        throw e
      })
  }

  async commit() {
    if (this.transaction) {
      if (!this.transaction.finished) {
        this.log(`Commit transaction on table ${this.entiyName}`);
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
        this.log(`Rollback transaction on table ${this.entiyName}`);
        return await this.transaction.rollback();
      }
      this.log("Rollback Transaction already finished", "WARNING")
      return this.transaction
    }
    throw new Error("Rollback No transaction found")
  }
}

module.exports = MigrateEntity
