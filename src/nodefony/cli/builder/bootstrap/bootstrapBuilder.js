class Bootstrap extends nodefony.Service {
  constructor(builder) {
    super("Bootstrap Builder", builder.cli.container, builder.cli.notificationsCenter);
    this.builder = builder;
    this.inquirer = this.builder.cli.inquirer;

  }



}


module.exports = Bootstrap;