class SandBox extends nodefony.Service {
  constructor(builder) {
    super("SandBox Builder", builder.cli.container, builder.cli.notificationsCenter);
    this.builder = builder;
    this.inquirer = this.builder.cli.inquirer;

  }



}


module.exports = SandBox;