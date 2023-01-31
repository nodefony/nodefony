class fixturesCommand extends nodefony.Command {
  constructor (cli, bundle) {
    super("fixtures", cli, bundle);
  }

  showHelp () {
    this.setHelp(
      "fixtures:list",
      "nodefony fixtures:list "
    );
    this.setHelp(
      "fixtures:load [bundleName] [fixtureName]",
      "run fixtures example: nodefony fixtures:load user users"
    );
    super.showHelp();
  }

  getFixtures (log = true) {
    const fix = {};
    for (const bundle in this.kernel.bundles) {
      fix[bundle] = [];
      const bund = this.kernel.bundles[bundle];
      const fixtures = bund.getFixtures();
      for (const fixture in fixtures) {
        if (log) {
          fix[bundle].push(new fixtures[fixture](this.container).name);
        } else {
          fix[bundle].push(new fixtures[fixture](this.container));
        }
      }
    }
    return fix;
  }

  list (log = true) {
    return new Promise((resolve) => {
      let fixtures = null;
      if (this.kernel.ready) {
        fixtures = this.getFixtures(log);
        if (log) {
          this.log(fixtures);
        }
        return resolve(fixtures);
      }
      this.kernel.once("onReady", () => {
        fixtures = this.getFixtures(log);
        if (log) {
          this.log(fixtures);
        }
        return resolve(fixtures);
      });
    });
  }

  async load (bundle = null, fixtureName = null) {
    try {
      const fixtures = await this.list(false);
      for (const fixture in fixtures) {
        if (bundle && fixture !== bundle) {
          continue;
        }
        this.log(`LOAD FIXTURE bundle : ${fixture}`, "INFO");
        for await (const fix of fixtures[fixture]) {
          if (fixtureName && fix.name !== fixtureName) {
            continue;
          }
          this.log(`RUN FIXTURE  : ${fix.name}`, "INFO");
          await fix.run();
        }
      }
      return fixtures;
    } catch (e) {
      throw e;
    }
  }
}

module.exports = fixturesCommand;
