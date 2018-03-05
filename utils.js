const fs = require('fs');
const path = require('path');
const co = require('co');
const { saveConfig } = require('./config');
const { APPLICATION } = require('./properties');

/**
 * Synchronously checks for provided file
 * @param file {string}
 * @returns {Promise}
 */
function fileExists(file) {
  return new Promise((resolve, reject) => {
    try {
      let result = fs.statSync(file).isFile();
      resolve(result);
    } catch (err) {
      if (err.code === 'ENOENT') {
        resolve(false);
      } else {
        reject(err);
      }
    }
  });
}

/**
 * Synchronously checks check for provided dir
 * @param dir {string}
 * @returns {Promise}
 */
function dirExists(dir) {
  return new Promise((resolve, reject) => {
    try {
      let result = fs.statSync(dir).isDirectory();
      resolve(result);
    } catch (err) {
      if (err.code === 'ENOENT') {
        resolve(false);
      } else {
        reject(err);
      }
    }
  });
}

/**
 * Validates strato configuration - config.yaml file
 * @returns {Promise}
 */
function validateConfig() {
  return new Promise((resolve, reject) => {

    const target = path.join(APPLICATION.HOME_PATH, APPLICATION.CONFIG_FOLDER, APPLICATION.CONFIG_FILE);

    co(function* () {

      let _exists = false;

      yield fileExists(target)
        .then((exists) => {
          _exists = exists;
        })
        .catch((err) => {
          return reject(err);
        })

      if (_exists) {
        return resolve();
      }

      console.log('In order to configure your strato environment, you must enter your information below');
      console.log('Note: if you have already completed this step, make sure that User\'s home directory /strato contains a config.yaml file');

      saveConfig()
        .then(() => {
          return resolve();
        })
        .catch((err) => {
          return reject(err);
        });

    });
  });
}

module.exports.dirExists = dirExists;
module.exports.validateConfig = validateConfig;