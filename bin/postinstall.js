#!/usr/bin/env node

const check = require(path.resolve("bin", "check.js"));

console.log(check.isNodefonyTrunk());
console.log(process.cwd());