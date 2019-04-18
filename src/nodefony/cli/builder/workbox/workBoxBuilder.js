class WorkBox extends nodefony.Service {
  constructor(builder) {
    super("WorkBox Builder", builder.cli.container, builder.cli.notificationsCenter);
    this.builder = builder;
    this.inquirer = this.builder.cli.inquirer;

  }



}


module.exports = WorkBox;