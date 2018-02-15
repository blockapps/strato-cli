#!/usr/bin/env node --harmony
const { main } = require("./config");

/**
 * Entry point for the bloc config command
 */
main().catch(err => {
  console.error(err);
});
