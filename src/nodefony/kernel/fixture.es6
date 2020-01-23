class Fixture extends nodefony.Service {
  constructor(name, container) {
    super(name, container);
    this.orm = this.kernel.getORM();
    this.ormName = this.orm.name;
  }

  async run(...args) {
    return new Promise((resolve) => {
      //console.log(...args)
      if (this.orm.ready) {
        return resolve(this.initialize.call(this, ...args));
      } else {
        this.orm.once("onOrmReady", () => {
          return resolve(this.initialize.call(this, ...args));
        });
      }
    });
  }
}
nodefony.Fixture = Fixture;
module.exports = Fixture;
