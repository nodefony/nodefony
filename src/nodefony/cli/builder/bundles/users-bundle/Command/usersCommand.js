class usersCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("users", cli, bundle);
    this.usersService = this.get("users");
  }

  showHelp() {
    this.setHelp("users:show [user]",
      "nodefony users:show admin"
    );
    this.setHelp("users:find [--json] username",
      "nodefony --json users:find admin"
    );
    this.setHelp("users:findAll [--json]",
      "nodefony --json users:findAll"
    );
    this.setHelp("users:fixtures ",
      "nodefony  users:fixtures"
    );
    super.showHelp();
  }

  async fixtures(){
    try{
      const fixtures = this.bundle.getFixtures() ;
      for (let fixture in fixtures){
          this.logger(`LOAD FIXTURE : ${fixture}`, "INFO");
          let inst = new fixtures[fixture].fixture(this.container);
          await inst.run();
      }
      return fixtures ;
    }catch(e){
      throw e ;
    }
  }

  async show(username) {
    let obj = null;
    if (username) {
      obj = await this.find(username);
    } else {
      obj = await this.findAll();
    }
  }

  find(username) {
    return this.usersService.findOne(username)
      .then((res) => {
        if (this.cli.commander.json) {
          return process.stdout.write(`${JSON.stringify(res)}\n`);
        } else {
          return this.display(res);
        }
      });
  }

  findAll() {
    return this.usersService.find()
      .then((res) => {
        if (this.cli.commander.json) {
          return process.stdout.write(`${JSON.stringify(res.rows)}\n`);
        } else {
          return this.display(res.rows);
        }
      });
  }

  display(obj) {
    this.cli.logger("START TABLE : " + this.cli.getEmoji("clapper"));
    const type = nodefony.typeOf(obj);
    if (type === "object" || type === null) {
      if (!obj) {
        obj = [];
      } else {
        obj = [obj];
      }
    }
    let options = {
      head: [
        "username",
        "First Name",
        "Last Name",
        "Email address",
        "Two Factor Auth",
        "Credentials Non Expired",
        "Enabled"
      ]
    };
    let table = this.cli.displayTable(null, options);
    for (let i = 0; i < obj.length; i++) {
      const user = obj[i];
      table.push([
        user.username,
        user.name,
        user.surname,
        user.email,
        user["2fa"],
        user.credentialsNonExpired,
        user.enabled
      ]);
    }
    console.log(table.toString());
    this.cli.logger("END TABLE : " + this.cli.getEmoji("checkered_flag"));
  }

}
module.exports = usersCommand;
