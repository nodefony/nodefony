const Command = class Command {
  constructor(cli) {
    this.cli = cli;
  }
  createBuilder() {
    return {};
  }

};

module.exports = Command;
