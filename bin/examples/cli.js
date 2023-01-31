#!/usr/bin/env node
// nodefony
let nodefony = null;
try {
  nodefony = require("nodefony");
} catch (e) {
  nodefony = require(require("path").resolve("src", "nodefony", "autoloader.es6"));
}

const simpleLogger = function (cli) {
  return new Promise((resolve, reject) => {
    cli.log(`START simpleLogger : ${cli.getEmoji("clapper")}`);
    cli.log(`Emoji : ${cli.getEmoji()}`);
    cli.blankLine();
    cli.log(`Emoji : ${cli.getEmoji()}`, "DEBUG");
    cli.blankLine();
    cli.log(`Emoji : ${cli.getEmoji()}`, "ERROR");
    cli.blankLine();
    cli.log(`Emoji : ${cli.getEmoji()}`, "WARNING");
    cli.log(`END simpleLogger : ${cli.getEmoji("checkered_flag")}`);
    resolve(cli);
  });
};

// CLI
const cli = new nodefony.cli("MY CLI", {
  resize: true,
  onResize: (cli) => {
    cli.log(`RESIZE : ${cli.getEmoji()}`);
  },
  onStart: (cli) => {
    cli.log("ON START");
    // PROMISE
    simpleLogger(cli).then((cli) =>
    // SPINNER
      spinner(cli, 5000))
      .then((cli) =>
        // TABLE
        tableExample(cli))
      .then((cli) =>
        // PROGRESS
        progress(cli, 20))
      .then((cli) =>
        // PROGRESS 2
        progress2(cli, 20))
      .then((cli) =>
        // Sparkline
        Sparkline(cli))
      .then((cli) =>
        // Sparkline 2
        Sparkline2(cli, 30))
      .then((cli) => {
        cli.log(`TERMINATE MY CLI : ${cli.getEmoji("checkered_flag")}`);
        cli.terminate();
      })
      .catch((e) => {
        console.log(e);
        cli.terminate(1);
      });
  }
});


const random = function (nb) {
  return Math.floor(Math.random() * nb) + 1;
};
const severity = [
  "EMERGENCY",
  "ALERT",
  "CRITIC",
  "ERROR",
  "WARNING",
  "NOTICE",
  "INFO",
  "DEBUG"
];
const spinner = function (cli, time) {
  return new Promise((resolve, reject) => {
    cli.log(`START SPINNER : ${cli.getEmoji("clapper")}`);
    cli.startSpinner("MY CLI", ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"]);
    cli.blankLine();
    cli.log(`MESSAGE : ${cli.getEmoji()}`);
    const interval = setInterval(() => {
      cli.spinlog(`MESSAGE : ${cli.getEmoji()}`, severity[random(7)]);
    }, 0);
    setTimeout(() => {
      cli.stopSpinner();
      cli.log(`END SPINNER : ${cli.getEmoji("checkered_flag")}`);
      clearInterval(interval);
      resolve(cli);
    }, time || 2000);
  });
};

const tableExample = function (cli) {
  return new Promise((resolve, reject) => {
    cli.log(`START TABLE : ${cli.getEmoji("clapper")}`);
    const options = {
      head: [
        "COLUMN 1",
        "COLUMN 2",
        "COLUMN 3",
        "COLUMN 4"
      ]
    };
    const table = cli.displayTable(null, options);
    for (let i = 0; i < 10; i++) {
      table.push([severity[random(7)], random(100), random(200), random(300)]);
    }
    console.log(table.toString());
    const tab = [];
    for (let i = 0; i < 10; i++) {
      tab.push([severity[random(7)], random(100), random(200), random(300)]);
    }
    const table2 = cli.displayTable(tab, options);
    cli.log(`END TABLE : ${cli.getEmoji("checkered_flag")}`);
    resolve(cli);
  });
};

const progress = function (cli, time) {
  return new Promise((resolve, reject) => {
    cli.log(`START PROGRESS : ${cli.getEmoji("clapper")}`);
    let i = 0;
    const pg = cli.createProgress(50);
    var interval = setInterval(() => {
      cli.log(pg.update(++i, 50), "SPINNER");
      if (i === 50) {
        cli.blankLine();
        clearInterval(interval);
        cli.log(`\u001b[13pEND PROGRESS : ${cli.getEmoji("checkered_flag")}`);
        resolve(cli);
      }
    }, time || 50);
  });
};

const progress2 = function (cli, time) {
  return new Promise((resolve, reject) => {
    cli.log(`START PROGRESS 2 : ${cli.getEmoji("clapper")}`);
    const pg = cli.createProgress(100);
    let i = 0;
    // cli.startSpinner("PROGRESS");
    var interval = setInterval(() => {
      cli.log(pg.update(++i, 100), "SPINNER");
      if (i === 100) {
        cli.blankLine();
        clearInterval(interval);
        // cli.stopSpinner();
        cli.log(`MY PROGRESS ${pg.update(i, 100)}`);
        cli.log(`END PROGRESS 2 : ${cli.getEmoji("checkered_flag")}`);
        resolve(cli);
      }
    }, time || 30);
  });
};

const Sparkline = function (cli, time) {
  return new Promise((resolve, reject) => {
    cli.log(`START Sparkline  : ${cli.getEmoji("clapper")}`);
    const sl = cli.createSparkline([10, 12, 3, 7, 12, 9, 23, 10, 9, 19, 16, 18, 12, 12], " reqs/sec");
    cli.log(sl);
    cli.log(`END Sparkline  : ${cli.getEmoji("checkered_flag")}`);
    resolve(cli);
  });
};

const Sparkline2 = function (cli, time) {
  return new Promise((resolve, reject) => {
    cli.log(`START Sparkline  : ${cli.getEmoji("clapper")}`);
    let i = 0;
    const tab = [];
    cli.startSpinner("Sparkline");
    const sl = cli.createSparkline(tab, " reqs/sec");
    var myInterval = setInterval(() => {
      ++i;
      tab.push(random(200));
      const sl = cli.createSparkline(tab, " reqs/sec");
      cli.log(sl, "SPINNER");
      if (i === 100) {
        cli.blankLine();
        clearInterval(myInterval);
        cli.stopSpinner();
        cli.log(`END Sparkline2 : ${cli.getEmoji("checkered_flag")}`);
        resolve(cli);
      }
    }, time || 30);
  });
};
