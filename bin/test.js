#!/usr/bin/env node

const nodefony = require("nodefony");



const questions = [{
    type: 'confirm',
    name: 'toBeDelivered',
    message: 'Is this for delivery?',
    default: false
  },
  {
    type: 'input',
    name: 'phone',
    message: 'What\'s your phone number?',
    validate: function(value) {
      var pass = value.match(/^([01]{1})?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\s?((?:#|ext\.?\s?|x\.?\s?){1}(?:\d+)?)?$/i);
      if (pass) {
        return true;
      }

      return 'Please enter a valid phone number';
    }
  },
  {
    type: 'list',
    name: 'size',
    message: 'What size do you need?',
    choices: ['Large', 'Medium', 'Small'],
    filter: function(val) {
      return val.toLowerCase();
    }
  },
  {
    type: 'input',
    name: 'quantity',
    message: 'How many do you need?',
    validate: function(value) {
      var valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a number';
    },
    filter: Number
  },
  {
    type: 'expand',
    name: 'toppings',
    message: 'What about the toppings?',
    choices: [{
        key: 'p',
        name: 'Pepperoni and cheese',
        value: 'PepperoniCheese'
      },
      {
        key: 'a',
        name: 'All dressed',
        value: 'alldressed'
      },
      {
        key: 'w',
        name: 'Hawaiian',
        value: 'hawaiian'
      }
    ]
  },
  {
    type: 'rawlist',
    name: 'beverage',
    message: 'You also get a free 2L beverage',
    choices: ['Pepsi', '7up', 'Coke']
  },
  {
    type: 'input',
    name: 'comments',
    message: 'Any comments on your purchase experience?',
    default: 'Nope, all good!'
  },
  {
    type: 'list',
    name: 'prize',
    message: 'For leaving a comment, you get a freebie',
    choices: ['cake', 'fries'],
    when: function(answers) {
      return answers.comments !== 'Nope, all good!';
    }
  }
];

const project = new nodefony.cli("project", {
  version: nodefony.version,
});
project.start()
  .then((cli) => {
    return cli.prompt(questions)
      .then(function(answers) {
        cli.log('\nOrder receipt:');
        cli.log(JSON.stringify(answers, null, '  '));
        return cli ;
      });
  })
  .then((cli) => {
    return cli.prompt(questions)
      .then(function(answers) {
        cli.log('\nOrder receipt:');
        cli.log(JSON.stringify(answers, null, '  '));
        return cli ;
      });
  })
  .catch(e => {
    console.trace(e);
  });


/*
const project = new nodefony.cli("project", {
  version: nodefony.version,
});
project.start()
  .then((cli) => {
    cli.idle();
    cli.showBanner();
    cli.blankLine();
    cli.commander.usage(`[options] <command1> [args...]`);

    cli.setCommand('rm <dir>')
      .option('-r, --recursive', 'Remove recursively')
      .action(function(dir, cmd) {
        console.log('remove ' + dir + (cmd.recursive ? ' recursively' : ''));
      });

    cli.setCommand('create <name>')
      .description('Create something in project')
      .alias('add')
      .option('-d, --debug <env>', 'Environment', /^(dev|prod|preprod)$/i, 'dev')
      .action((create, command) => {
        cli.log(create, "INFO", "COMMAND ARGUMENTS");
        cli.log(command.debug, "INFO", "COMMAND OPTIONS");
      })
      // custom command help
      .on('--help', () => {
        cli.blankLine();
        console.log('Examples:');
        console.log('  $ project create -name hello ');
        console.log('  $ project create -name hello -d ');
      });

    // custom global help
    cli.commander.on('--help', () => {
      cli.blankLine();
      console.log('Examples:');
      console.log('  $ project create -name hello ');
      console.log('  $ project -h');
      cli.blankLine();
    });

    //cli.commander.arguments(`<cmd> [args...]`);
    cli.parseCommand();
  })
  .catch(e => {
    console.trace(e);
  });




/*
const project = new nodefony.cli("project", {
  version: nodefony.version,
});
project.start()
  .then((cli) => {
    cli.idle();
    cli.showBanner();

    cli.logger("START SPINNER : " + cli.getEmoji("clapper"));
    cli.startSpinner("MY CLI", ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']);
    cli.blankLine();

    let interval = setInterval(() => {
      cli.logger("MESSAGE : " + cli.getEmoji());
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      cli.stopSpinner();
      cli.logger("STOP SPINNER : " + cli.getEmoji("clapper"));
    }, 10000);
  })
  .catch(e => {
    console.trace(e);
  });

const project = new nodefony.cli("project", {
  version: nodefony.version,
});
project.start()
  .then((cli) => {
    cli.idle();
    cli.showBanner();
    // show cli-table  https://github.com/Automattic/cli-table
    cli.log("TABLE 1");
    cli.displayTable([
      ['First value', 'Second value', cli.clc.red("third value")]
    ]);

    cli.blankLine();
    cli.log("TABLE 2");
    cli.displayTable([
        ['First value', 'Second value', cli.getEmoji()]
      ], {},
      true);

    cli.blankLine();
    cli.log("TABLE 3");
    cli.displayTable([
      ['First value', 'Second value', cli.clc.magenta("third value")]
    ], {
      head: ["Header 1", "Header 2", "Header 3"]
    });

  })
  .catch(e => {
    console.trace(e);
  });

/*

const project = new nodefony.cli("project", {
  version: nodefony.version,
  onStart: (cli) => {
    cli.idle();
    cli.showBanner();
    cli.log("start");
    cli.log("start", "WARNING");
    cli.log("start", "ERROR");
    cli.log("start", "DEBUG");
    cli.log("start", "NOTICE", "TERMINAL");
  }

});*/

/*const finder = new nodefony.finder();
console.log(finder)


finder.in(path.resolve("node_modules"))
console.log(finder)



finder.directories()*/
