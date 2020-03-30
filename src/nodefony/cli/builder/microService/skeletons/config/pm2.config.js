const path = require("path");
const package = require(path.resolve("package.json"));
const env = process.env.NODE_ENV;
const logName = `${package.name}.log`;

let cpu = require('os').cpus().length;
let exec_mode = "cluster";
let watch = false;
let autorestart =true ;

if (env === "development") {
  cpu = 1;
  exec_mode = "fork";
  watch = true;
  autorestart= false;
}

module.exports = {
  apps: [{
    name: package.name,
    script: path.resolve(__dirname, "..", "src", "node", "index.js"),
    args: "pm2",
    //node_args           : "--expose-gc",
    watch: watch,
    // anymatch format https://github.com/micromatch/anymatch
    ignore_watch: ["node_modules", "dist", "bin", "tests", "tmp"],
    time: false,
    exec_mode: exec_mode,
    instances: cpu,
    max_memory_restart: "1024M",
    autorestart: autorestart,
    max_restarts: 10,
    //log_file            : logFile,
    out_file: path.resolve("tmp", logName),
    error_file: path.resolve("tmp", logName),
    merge_logs: true,
    env: {
      "NODE_ENV": "development",
      "MODE_START": "PM2"
    },
    env_production: {
      "NODE_ENV": "production",
      "MODE_START": "PM2"
    }
  },{
    name: "examples",
    script: path.resolve(__dirname, "..", "src", "node", "examples", "index.js"),
    args: "pm2",
    //node_args           : "--expose-gc",
    watch: watch,
    // anymatch format https://github.com/micromatch/anymatch
    ignore_watch: ["node_modules", "dist", "bin", "tests", "tmp"],
    time: false,
    exec_mode: exec_mode,
    instances: cpu,
    max_memory_restart: "1024M",
    autorestart: true,
    max_restarts: 10,
    //log_file            : path.resolve("tmp", "examples.log"),
    out_file: path.resolve("tmp", "examples.log"),
    error_file: path.resolve("tmp", "examples.log"),
    merge_logs: true,
    env: {
      "NODE_ENV": "development",
      "MODE_START": "PM2"
    },
    env_production: {
      "NODE_ENV": "production",
      "MODE_START": "PM2"
    }
  }]
};
