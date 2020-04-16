const cpu = require('os').cpus().length;
const path = require("path");

const package = require(path.resolve("package.json"));
const name = package.name;
const script = process.argv[1] || "nodefony";

module.exports = {
  apps: [{
    name: name,
    script: script,
    args: "pm2",
    //node_args           : "--expose-gc",
    watch: false,
    exec_mode: "cluster",
    instances: cpu,
    max_memory_restart: "1024M",
    autorestart: true,
    max_restarts: 10,
    //log_file            : "./tmp/nodefony.log",
    out_file: path.resolve("tmp", `${name}.log`),
    error_file: path.resolve("tmp", `${name}.error`),
    merge_logs: true,
    env: {
      "NODE_ENV": "production",
      "MODE_START": "PM2",
      "NODEFONY_DEBUG": false
    }
  }]
};
