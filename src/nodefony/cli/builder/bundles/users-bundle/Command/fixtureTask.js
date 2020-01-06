class fixtureTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.bundle = command.bundle;
  }

  showHelp() {
    this.setHelp("users:fixtures:default",
      "nodefony  users:fixtures:default generate admin, anonymous and 3 common users"
    );
    this.setHelp("users:fixtures:random [nb]",
      "nodefony  users:fixtures:random [nb = 10] generate ramdom users with faker"
    );
  }

  async default (args = null) {
    try {
      const fixtures = this.bundle.getFixture("users");
      if (fixtures) {
        this.logger(`LOAD FIXTURES users : ${args}`, "INFO");
        let inst = new fixtures(this.container);
        return await inst.run(args);
      }
      throw new Error(`users fixtures not found `);

    } catch (e) {
      throw e;
    }
  }

  async random(args = null) {
    try {
      const fixtures = this.bundle.getFixture("users");
      if (fixtures) {
        this.logger(`RANDOM FIXTURES users : ${args}`, "INFO");
        let inst = new fixtures(this.container);
        return await inst.run(args);
      }
      throw new Error(`users fixtures not found `);
    } catch (e) {
      throw e;
    }
  }

}

module.exports = fixtureTask;