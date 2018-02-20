const { main } = require("./config");

/**
 * Entry point for the strato config command
 */
main().catch(err => {
  console.error(err);
});
