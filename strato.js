#!/usr/bin/env node --harmony
const program = require("commander");
const pkg = require('./package.json');

// entry point for strato command
program
  // version number for strato command
  .version(pkg.version)

  // sub-commands defined here
  .command("config", "assign and store host address globally in storage file")
  .command("init", "create a new app project")
  .command("upload <dir>", "upload your app to STRATO")
  .command("balance", "check your account balance");

// append custom text to commander library's internal help function
program.on("--help", () => {
  console.log("\n\nSee more at http://developers.blockapps.net\n\n");
});

program.parse(process.argv);

// calling strato --help when no sub-command provided
if (!program.args.length) program.help();
