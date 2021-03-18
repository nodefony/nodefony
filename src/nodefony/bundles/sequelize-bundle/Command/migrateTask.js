class migrateTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.umzugService = this.get("umzug");
  }

  showHelp() {
    this.setHelp("sequelize:migrate:status",
      "Current Status Migrations"
    );
    this.setHelp("sequelize:migrate:executed",
      "Getting all executed migrations"
    );
    this.setHelp("sequelize:migrate:pending",
      "Getting all pending migrations"
    );
    this.setHelp("sequelize:migrate:up [connector]",
      "Executing pending migrations  $ nodefony sequelize:migrate:up nodefony "
    );
    this.setHelp("sequelize:migrate:down [connector]",
      "Reverting executed migration  $ nodefony sequelize:migrate:down nodefony "
    );
    this.setHelp("sequelize:migrate:revert [connector]",
      "Reverting all executed migrations  $ nodefony sequelize:migrate:revert "
    );
  }

  async status() {
    this.log(`Status ....`);
    await this.umzugService.pending();
    await this.umzugService.executed();
  }

  async executed(connector) {
    //await this.run(connector)
    if (this.kernel.ready) {
      return await this.umzugService.executed(connector)
    } else {
      return new Promise((resolve, reject) => {
        try {
          this.sequelizeService.once("onOrmReady", async () => {
            return resolve(await this.umzugService.executed(connector));
          });
        } catch (e) {
          return reject(e);
        }
      });
    }
  }

  async pending(connector) {
    if (this.kernel.ready) {
      return await this.umzugService.pending(connector);
    } else {
      return new Promise((resolve, reject) => {
        try {
          this.sequelizeService.once("onOrmReady", async () => {
            return resolve(await this.umzugService.pending(connector));
          });
        } catch (e) {
          return reject(e);
        }
      });
    }
  }

  async up(connector) {
    if (this.kernel.ready) {
      return await this.umzugService.up(connector)
    } else {
      this.sequelizeService.once("onOrmReady", async () => {
        return await this.umzugService.up(connector)
      });
    }
  }
  async down(connector) {
    if (this.kernel.ready) {
      return await this.umzugService.down(connector)
    } else {
      this.sequelizeService.once("onOrmReady", async () => {
        return await this.umzugService.down(connector)
      });
    }
  }

  async revert(connector) {
    if (this.kernel.ready) {
      return await this.umzugService.revertAll(connector)
    } else {
      this.sequelizeService.once("onOrmReady", async () => {
        return await this.umzugService.revertAll(connector)
      });
    }
  }


}

module.exports = migrateTask;
