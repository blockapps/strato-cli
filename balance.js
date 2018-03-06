const path = require('path');
const fs = require('fs');
const rp = require('request-promise');
const yaml = require('js-yaml');
const co = require('co');
const urljoin = require('url-join');
const { validateConfig } = require('./utils');
const { APPLICATION, API_ENDPOINTS } = require('./properties');

let data = {
    username: null,
    hostname: null,
    address: null,
    balance: null
}

/**
 * Entry point for strato balance command
 */
function getBalance() {
    return new Promise((resolve, reject) => {
        co(function* () {

            yield validateConfig()
                .catch((err) => {
                    reject(err);
                });

            yield readYAML()
                .catch((err) => {
                    reject(err);
                });

            yield getUserAddress()
                .catch((err) => {
                    reject(err);
                });

            yield fetchBalance()
                .then((result) => {
                    resolve(result);
                })
                .catch((err) => {
                    reject(err);
                });
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
   
        const url = urljoin(data.hostname, API_ENDPOINTS.BLOC_GET_USER_ADDRESS, data.username);

        let options = {
            method: 'GET',
            url: url,
            followRedirect: true,
        }

        rp(options)
            .then((response) => {
                try {
                    let address = JSON.parse(response);
                    if (address.length > 0) {
                        data.address = address[0];
                        resolve();
                    } else {
                        reject('username not found. try running strato config to modify username');
                    }
                } catch (err) {
                    reject('the hostname provided is not the STRATO node');
                }
            })
            .catch((err) => {
                if (err.error.code === 'ECONNREFUSED') {
                    reject('could not connect to the host. try running strato config to modify the hostname');
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

        let url = urljoin(data.hostname, API_ENDPOINTS.STRATO_GET_BALANCE);

        let options = {
            method: 'GET',
            url: url,
            qs: {
                address: data.address
            },
            followRedirect: true,
        }

        rp(options)
            .then((response) => {
                try {
                    let balance = JSON.parse(response);
                    if (balance.length > 0) {
                        data.balance = balance[0].balance;
                        resolve(data);
                    } else {
                        data.balance = -1 ;
                        resolve(data);
                    }

                } catch (err) {
                    reject('the hostname provided is not the STRATO node');
                }
            })
            .catch((err) => {
                if (err.error.code === 'ECONNREFUSED') {
                    reject('could not connect to the host. try running strato config to modify the hostname');
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

module.exports.getBalance = getBalance;