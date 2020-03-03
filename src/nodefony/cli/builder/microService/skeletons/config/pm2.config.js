const path = require("path");
const package = require(path.resolve("package.json"));
const env = process.env.NODE_ENV;
const logName = `${package.name}.log`;
const logFile = path.resolve("tmp", logName);

let cpu = require('os').cpus().length;
let exec_mode = "cluster";
let watch = false;

if (env === "development") {
  cpu = 1;
  exec_mode = "fork";
  watch = true;
}

module.exports = {
  apps: [{
    name: package.name,
    script: path.resolve(__dirname, "..", "src", "node", "index.js"),
    args: "pm2",
    //node_args           : "--expose-gc",
    watch: watch,
    ignore_watch: ["node_modules", "^dist$", "^bin$", "^test$", "^tmp$"],
    time: false,
    exec_mode: exec_mode,
    instances: cpu,
    max_memory_restart: "1024M",
    autorestart: true,
    max_restarts: 10,
    //log_file            : "./tmp/service.log",
    out_file: logFile,
    error_file: logFile,
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
