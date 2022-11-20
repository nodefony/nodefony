class seedeersTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.umzugService = this.get("umzug");
  }

  showHelp() {
    this.setHelp("sequelize:seedeers:status [connector]",
      "Current Status Seedeers"
    );
    this.setHelp("sequelize:seedeers:executed",
      "Getting all executed Seedeers"
    );
    this.setHelp("sequelize:seedeers:pending",
      "Getting all pending Seedeers"
    );
    this.setHelp("sequelize:seedeers:up [connector]",
      "Executing pending Seedeers  $ nodefony sequelize:seedeers:up nodefony "
    );
    this.setHelp("sequelize:seedeers:down [connector]",
      "Reverting executed Seedeers  $ nodefony sequelize:seedeers:down nodefony "
    );
    this.setHelp("sequelize:seedeers:revert [connector]",
      "Reverting all executed Seedeers  $ nodefony sequelize:seedeers:revert "
    );
    this.setHelp("sequelize:seedeers:create [connector] filenane",
      "Generate template Seedeers file  $ nodefony sequelize:seedeers:create userSeeds.js"
    );
  }

  async status(connector) {
    this.log(`Status ....`);
    await this.umzugService.pending(connector, true, "seedeers");
    await this.umzugService.executed(connector, true, "seedeers");
  }

  async executed(connector) {
    //await this.run(connector)
    if (this.kernel.ready) {
      return await this.umzugService.executed(connector, true, "seedeers")
    } else {
      return new Promise((resolve, reject) => {
        try {
          this.sequelizeService.once("onOrmReady", async () => {
            return resolve(await this.umzugService.executed(connector, true, "seedeers"));
          });
        } catch (e) {
          return reject(e);
        }
      });
    }
  }

  async pending(connector) {
    if (this.kernel.ready) {
      return await this.umzugService.pending(connector, true, "seedeers");
    } else {
      return new Promise((resolve, reject) => {
        try {
          this.sequelizeService.once("onOrmReady", async () => {
            return resolve(await this.umzugService.pending(connector, true, "seedeers"));
          });
        } catch (e) {
          return reject(e);
        }
      });
    }
  }

  async up(connector) {
    if (this.kernel.ready) {
      return await this.umzugService.up(connector, {}, "seedeers")
    } else {
      this.sequelizeService.once("onOrmReady", async () => {
        return await this.umzugService.up(connector, {}, "seedeers")
      });
    }
  }
  async down(connector) {
    if (this.kernel.ready) {
      return await this.umzugService.down(connector, {}, "seedeers")
    } else {
      this.sequelizeService.once("onOrmReady", async () => {
        return await this.umzugService.down(connector, {}, "seedeers")
      });
    }
  }

  async revert(connector) {
    if (this.kernel.ready) {
      return await this.umzugService.revertAll(connector, "seedeers")
    } else {
      this.sequelizeService.once("onOrmReady", async () => {
        return await this.umzugService.revertAll(connector, "seedeers")
      });
    }
  }

  async create(connector, name) {
    if (this.kernel.ready) {
      return await this.umzugService.createSeedeers(connector, name)
    } else {
      this.sequelizeService.once("onOrmReady", async () => {
        return await this.umzugService.createSeedeers(connector, name)
      });
    }
  }

}

module.exports = seedeersTask;
