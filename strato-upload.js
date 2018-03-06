const program = require('commander');
const { prompt } = require('inquirer');
const rp = require('request-promise');
const yaml = require('js-yaml');
const co = require('co');
const fs = require('fs');
const path = require('path');
const urljoin = require('url-join');
const { validateConfig, dirExists } = require('./utils');
const { getBalance } = require('./balance');
const { APPLICATION, API_ENDPOINTS } = require('./properties');
const { zipFolder } = require('./strato-ziplib');

let data = {
  username: null,
  address: null,
  hostname: null,
  password: null
};

program.arguments('<dir>').action((dir) => {

  currentDir = process.cwd();
  dirValue = dir;
  const dAppDir = path.join(currentDir, dirValue);
  const zipTarget = path.join(APPLICATION.HOME_PATH, APPLICATION.CONFIG_FOLDER, APPLICATION.ZIP_FILE);

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

    yield validateDApp(dAppDir)
      .catch((err) => {
        console.error('Error: ' + err);
        process.exit();
      });

    yield getBalance()
      .then((result) => {
        if (result.balance <= 0) {
          console.error('Sorry! You don\'t have enough tokens. Please send an email with your account address to product@blockapps.net to request funds');
          process.exit();
        }
      })
      .catch((err) => {
        console.error('Error: ' + err);
        process.exit();
      })

    yield zipFolder(dAppDir, zipTarget)
      .catch((err) => {
        console.error('Error: ' + err);
        deleteZip()
          .then(() => {
            process.exit();
          })
          .catch(() => {
            process.exit();
          });
      });

    yield getUserAddress()
      .catch((err) => {
        console.error('Error: ', err);
        process.exit();
      });

    yield getPassword()
      .then((password) => {
        data.password = password.password;
      })
      .catch((err) => {
        console.error('Error: ' + err);
        process.exit();
      });

    yield uploadZip()
      .then((response) => {
        deleteZip();
        console.log(response);
      })
      .catch((err) => {
        console.error('Error: ' + err);
        deleteZip();
        process.exit();
      });

  });
});

program.parse(process.argv);

if (typeof dirValue === 'undefined') {
  console.error('project path required with respect to User\'s home directory! Please refer to strato --help');
  process.exit();
}

/**
 * Validate dApp folder structure
 * @returns {Promise}
 */
function validateDApp(dAppDir) {
  return new Promise((resolve, reject) => {
    dirExists(dAppDir)
      .then((exists) => {

        if (exists) {

          let contents = fs.readdirSync(dAppDir);

          let _tmpPath = path.join(dAppDir, 'index.html');
          if (!(contents.indexOf('index.html') > -1 && fs.statSync(_tmpPath).isFile())) {
            return reject('missing index.html file');
          }

          _tmpPath = path.join(dAppDir, 'metadata.json');
          if (!(contents.indexOf('metadata.json') > -1 && fs.statSync(_tmpPath).isFile())) {
            return reject('missing metadata.json file');
          }

          _tmpPath = path.join(dAppDir, 'contracts');
          if (contents.indexOf('contracts') > -1 && fs.statSync(_tmpPath).isDirectory()) {

            _tmpPath = path.join(dAppDir, 'contracts');
            contents = fs.readdirSync(_tmpPath);

            contents.forEach((file) => {
              _tmpPath = path.join(dAppDir, 'contracts', file);
              if (!(path.extname(file) === '.sol' && fs.statSync(_tmpPath).isFile())) {
                return reject('contracts folder should only include .sol file(s)');
              }
              if (/^\..*/.test(file)) {
                return reject('contracts folder contains hidden file(s)');
              }
            });

            resolve();

          } else {
            return reject('missing contracts folder');
          }

        } else {
          return reject('cannot find dApp at ' + dirValue + '\nNote: path must be with respects to User\'s home directory');
        }

      })
      .catch((err) => {
        console.error('Error: ' + err);
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
    const url = urljoin(data.hostname, API_ENDPOINTS.BLOC_GET_USER_ADDRESS, data.username);

    let options = {
      method: 'GET',
      url: url,
      followRedirect: true
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
 * Upload zip on host
 * @returns {Promise}
 */
function uploadZip() {
  return new Promise((resolve, reject) => {

    const url = urljoin(data.hostname, API_ENDPOINTS.APEX_UPLOAD_ZIP);
    const zipFile = path.join(APPLICATION.HOME_PATH, APPLICATION.CONFIG_FOLDER, APPLICATION.ZIP_FILE);

    let options = {
      method: 'POST',
      url: url,
      formData: {
        username: data.username,
        password: data.password,
        address: data.address,
        file: {
          value: fs.createReadStream(zipFile),
          options: {
            filename: APPLICATION.ZIP_FILE,
            contentType: 'application/zip'
          }
        }
      },
      followRedirect: true
    }

    console.log('uploading...');

    rp(options)
      .then((response) => {
        try {
          let url = JSON.parse(response).url;
          resolve('application successfully deployed at ' + url);
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
            try {
              let text = JSON.parse(err.error).error.message;
              reject(text);
            } catch (error) {
              reject('status code: ' + err.statusCode);
            }
          }
        }
      })
      .finally(() => {
        const target = path.join(APPLICATION.HOME_PATH, APPLICATION.CONFIG_FOLDER, APPLICATION.ZIP_FILE);
        if (fs.existsSync(target)) {
          fs.unlinkSync(target);
        }
      });
  });
}

/**
 * Detele zip file created in User's home directory /strato
 */
function deleteZip() {
  return new Promise((resolve, reject) => {
    const target = path.join(APPLICATION.HOME_PATH, APPLICATION.CONFIG_FOLDER, APPLICATION.ZIP_FILE);
    if (fs.existsSync(target)) {
      fs.unlink(target, (err) => {
        if (err) {
          return reject('Error: unable to delete temporary zip folder');
        }
        resolve();
      });
    }
  });
}

/**
 * Get password
 * @returns {Promise}
 */
function getPassword() {
  return new Promise((resolve, reject) => {
    prompt({
        type: 'password',
        name: 'password',
        message: 'password: ',
        validate: value => {
          if (!value) return 'password required';
          return true;
        }
      })
      .then((password) => {
        resolve(password);
      })
      .catch((err) => {
        reject(err);
      });
  });
}