class migrateTask extends nodefony.Task {
  constructor (name, command) {
    super(name, command);
    this.umzugService = this.get("umzug");
  }

  showHelp () {
    this.setHelp(
      "sequelize:migrate:status [connector]",
      "Current Status Migrations"
    );
    this.setHelp(
      "sequelize:migrate:executed",
      "Getting all executed migrations"
    );
    this.setHelp(
      "sequelize:migrate:pending",
      "Getting all pending migrations"
    );
    this.setHelp(
      "sequelize:migrate:up [connector]",
      "Executing pending migrations  $ nodefony sequelize:migrate:up nodefony "
    );
    this.setHelp(
      "sequelize:migrate:down [connector]",
      "Reverting executed migration  $ nodefony sequelize:migrate:down nodefony "
    );
    this.setHelp(
      "sequelize:migrate:revert [connector]",
      "Reverting all executed migrations  $ nodefony sequelize:migrate:revert "
    );
    this.setHelp(
      "sequelize:migrate:create [connector] filenane",
      "Generate template migration file  $ nodefony sequelize:migrate:create userMigrate.js"
    );
  }

  async status (connector) {
    this.log("Status ....");
    await this.umzugService.pending(connector)
      .catch((e) => {
        console.trace(e);
        this.log(e, "ERROR");
        throw e;
      });
    return await this.umzugService.executed(connector)
      .catch((e) => {
        console.trace(e);
        this.log(e, "ERROR");
        throw e;
      });
  }

  async executed (connector) {
    // await this.run(connector)
    if (this.kernel.ready) {
      return await this.umzugService.executed(connector)
        .catch((e) => {
          this.log(e, "ERROR");
          throw e;
        });
    }
    return new Promise((resolve, reject) => {
      try {
        this.sequelizeService.once("onOrmReady", async () => resolve(await this.umzugService.executed(connector)));
      } catch (e) {
        return reject(e);
      }
    });
  }

  async pending (connector) {
    if (this.kernel.ready) {
      return await this.umzugService.pending(connector);
    }
    return new Promise((resolve, reject) => {
      try {
        this.sequelizeService.once("onOrmReady", async () => resolve(await this.umzugService.pending(connector)));
      } catch (e) {
        return reject(e);
      }
    });
  }

  async up (connector) {
    if (this.kernel.ready) {
      return await this.umzugService.up(connector)
        .catch((e) => {
          this.log(e, "ERROR");
          throw e;
        });
    }
    this.sequelizeService.once("onOrmReady", async () => await this.umzugService.up(connector)
      .catch((e) => {
        this.log(e, "ERROR");
        throw e;
      }));
  }

  async down (connector) {
    if (this.kernel.ready) {
      return await this.umzugService.down(connector)
        .catch((e) => {
          this.log(e, "ERROR");
          throw e;
        });
    }
    this.sequelizeService.once("onOrmReady", async () => await this.umzugService.down(connector)
      .catch((e) => {
        this.log(e, "ERROR");
        throw e;
      }));
  }

  async revert (connector) {
    if (this.kernel.ready) {
      return await this.umzugService.revertAll(connector)
        .catch((e) => {
          this.log(e, "ERROR");
          throw e;
        });
    }
    this.sequelizeService.once("onOrmReady", async () => await this.umzugService.revertAll(connector)
      .catch((e) => {
        this.log(e, "ERROR");
        throw e;
      }));
  }

  async create (connector, name) {
    if (this.kernel.ready) {
      return await this.umzugService.create(connector, name)
        .catch((e) => {
          this.log(e, "ERROR");
          throw e;
        });
    }
    this.sequelizeService.once("onOrmReady", async () => await this.umzugService.create(connector, name)
      .catch((e) => {
        this.log(e, "ERROR");
        throw e;
      }));
  }
}

module.exports = migrateTask;
