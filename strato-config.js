const { saveConfig } = require('./config');

/**
 * Entry point for the strato config command
 */
saveConfig()
  .catch((err) => {
    console.error('Error: ' + err);
    process.exit();
  });