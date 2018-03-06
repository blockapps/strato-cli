const path = require('path');
const yaml = require('write-yaml');
const co = require('co');
const { prompt } = require('inquirer');
const { APPLICATION } = require('./properties');

let username = [{
  type: 'input',
  name: 'username',
  message: 'username: ',
  validate: value => {
    if (!value) {
      return 'username required';
    }
    return true;
  }
}];

let hostname = [{
  type: 'input',
  name: 'hostname',
  message: 'hostname: ',
  validate: value => {
    if (!value) {
      return 'hostname required';
    }
    return true;
  }
}];

let configStruct = {
  username: null,
  hostname: APPLICATION.TESTNET
};

/**
 * Entry point for the strato config command
 * @returns {Promise}
 */
function saveConfig() {
  return new Promise((resolve, reject) => {

    co(function* () {

      console.log('Please enter the configuration information:');

      yield prompt(username)
        .then((data) => {
          configStruct.username = data.username;
          console.log('Press [ ENTER ] for Default Host');
          console.log('Press [ SPACE ] for Custom Host');
        })
        .catch((err) => {
          return reject(err);
        });

      let _key;

      yield captureKeys()
        .then((key) => {
          _key = key;
        });

      if (_key === 'SPACE') {
        yield prompt(hostname)
          .then(data => {
            let hostname = data.hostname;
            if(!hostname.startsWith('http://') && !hostname.startsWith('https://')) {
              configStruct.hostname = 'http://' + hostname;
            } else {
              configStruct.hostname = hostname;
            }
          })
          .catch((err) => {
            return reject(err);
          });
      }

      yield generateYAML()
        .then(() => {
          return resolve();
        })
        .catch((err) => {
          return reject(err);
        });

    });
  });
}


/**
 * Capture Keys
 * @returns {Promise}
 */
function captureKeys() {
  return new Promise((resolve, reject) => {
    let stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.addListener('data', (key) => {
      if (key === '\u000D') {
        stdin.pause();
        stdin.removeAllListeners('data');
        resolve('ENTER');
      } else if (key === '\u0020') {
        stdin.pause();
        stdin.removeAllListeners('data');
        resolve('SPACE');
      } else if (key === '\u0003') {
        process.exit();
      }
    });
  });
}

/**
 * Generate config.yaml inside User's home directory /strato
 * @returns {Promise}
 */
function generateYAML() {
  return new Promise((resolve, reject) => {
    const target = path.join(APPLICATION.HOME_PATH, APPLICATION.CONFIG_FOLDER, APPLICATION.CONFIG_FILE);
    yaml(target, configStruct, err => {
      if (err) {
        return reject(err);
      }
      console.log('Configuration file has been saved');
      resolve();
    });
  });
}

module.exports.saveConfig = saveConfig;