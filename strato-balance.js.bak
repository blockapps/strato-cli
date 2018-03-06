const path = require('path');
const fs = require('fs');
const rp = require('request-promise');
const yaml = require('js-yaml');
const co = require('co');
const { validateConfig } = require('./utils');
const { APPLICATION, API_ENDPOINTS } = require('./properties');

let data = {
  username: null,
  hostname: null,
  address: null
}

/**
 * Entry point for strato balance command
*/
function getBalance() {

  co(function* () {

    yield validateConfig()
      .catch((err) => {
        console.error('Error: ' + err);
        process.exit();
      });

    yield readYAML()
      .catch((err) => {
        console.error('Error: ' + err);
        process.exit();
      });

    yield getUserAddress()
      .catch((err) => {
        console.error('Error: ', err);
        process.exit();
      });

    yield fetchBalance()
      .then((text) => {
        console.log(text);
      })
      .catch((err) => {
        console.error('Error: ', err);
        process.exit();
      });

  });
}

/**
 * Read config.yaml file
 * @returns {Promise}
 */
function readYAML() {
  return new Promise((resolve, reject) => {
    const YAMLFile = path.join(APPLICATION.HOME_PATH, APPLICATION.CONFIG_FOLDER, APPLICATION.CONFIG_FILE);
    try {
      const config = yaml.safeLoad(fs.readFileSync(YAMLFile, 'utf8'));
      data.username = config.username;
      data.hostname = config.hostname;
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Fetch user address 
 * @returns {Promise}
 */
function getUserAddress() {
  return new Promise((resolve, reject) => {

    // TODO: construct url using URL module
    const url = data.hostname + API_ENDPOINTS.BLOC_GET_USER_ADDRESS + data.username

    let options = {
      method: 'GET',
      url: url,
      followRedirect: false
    }

    rp(options)
      .then((address) => {
        let _address;
        try {
          _address = JSON.parse(address);
          if (_address.length > 0) {
            data.address = _address[0];
            resolve();
          } else {
            reject('username not found. try running strato config to modify username');
          }
        } catch (err) {
          console.error('Error :' + err);
          process.exit();
        }
      })
      .catch((err) => {
        if (err.error.code === 'ECONNREFUSED') {
          reject('could not connect to the host. try running strato config to modify host address');
        } else if (err.error.code === 'ENOTFOUND') {
          reject('could not connect to the host');
        } else {
          if (err.error.code) {
            reject('status code: ' + err.error.code);
          } else {
            reject('status code: ' + err.statusCode);
          }
        }
      });
  });
}

/**
 * Fetch user balance 
 * @returns {Promise}
 */
function fetchBalance() {
  return new Promise((resolve, reject) => {

    let uri = data.hostname + API_ENDPOINTS.STRATO_GET_BALANCE;

    let options = {
      method: 'GET',
      uri: uri,
      qs: {
        address: data.address
      }
    }

    rp(options)
      .then((response) => {
        try {
          let balance = JSON.parse(response);
          if (balance.length > 0) {
            resolve('Balance for ' + data.username + ' (' + data.address + ') : ' + balance[0].balance);
          } else {
            resolve('Balance for ' + data.username + ' (' + data.address + ') : NIL');
          }

        } catch (err) {
          console.error('Error :' + err);
          process.exit();
        }
      })
      .catch((err) => {
        if (err.error.code === 'ECONNREFUSED') {
          reject('could not connect to the host. try running strato config to modify host address');
        } else if (err.error.code === 'ENOTFOUND') {
          reject('could not connect to the host');
        } else {
          if (err.error.code) {
            reject('status code: ' + err.error.code);
          } else {
            reject('status code: ' + err.statusCode);
          }
        }
      });

  });
}

getBalance();