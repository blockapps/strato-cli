const program = require('commander');
const { prompt } = require('inquirer');
const request = require('request');
const co = require('co');
const unzip = require('unzip');
const fs = require('fs');
const path = require('path');
const { validateConfig } = require('./utils');
const { APPLICATION } = require('./properties');

let questions = [{
    type: 'input',
    name: 'name',
    message: 'app title: ',
    validate: value => {
      let reg = /^[a-zA-Z0-9]*$/;
      if (!value) {
        return 'title required';
      } else {
        if (value.length > 20) {
          return 'app title must be less than 20 characters';
        } else if (fs.existsSync(value)) {
          return 'app with title ' + value + ' already exists';
        } else if (!reg.test(value)) {
          return 'title can only include letters and numbers';
        } else {
          return true;
        }
      }
    }
  },
  {
    type: 'input',
    name: 'description',
    message: 'app description: ',
    validate: value => {
      if (!value) {
        return 'description required';
      } else {
        if (value.length > 50) {
          return 'app description must be less than 50 characters';
        }
        return true;
      }
    }
  },
  {
    type: 'input',
    name: 'version',
    message: 'version: ',
    validate: value => {
      let reg = /^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/;
      if (!value) {
        return 'version number required';
      } else {
        if (!reg.test(value)) {
          return 'please enter a valid version';
        }
        return true;
      }
    }
  },
  {
    type: 'input',
    name: 'maintainer',
    message: 'email: ',
    validate: value => {
      let reg = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
      if (!value) {
        return 'email id required';
      } else {
        if (!reg.test(value)) {
          return 'please enter a valid email address';
        }
        return true;
      }
    }
  }
];

let metadata = {
  name: null,
  description: null,
  version: null,
  maintainer: null
};

/**
 * Entry point for strato init command
 */
function createSample() {
  co(function* () {

    yield validateConfig()
      .catch((err) => {
        console.error('Error: ' + err);
        process.exit();
      });

    yield getAppInfo()
      .catch((err) => {
        console.error('Error: ' + err);
        process.exit();
      });

    yield downloadSampleDApp()
      .catch((err) => {
        console.error('Error: ' + err);
        deleteZip()
          .then(() => {
            process.exit();
          });
      });

    yield extractZip();

    yield renameSampleApp()
      .catch((err) => {
        console.error('Error: ' + err);
        process.exit();
      });

    yield deleteZip();

    yield writeMetadata()
      .then((text) => {
        console.log(text)
      })
      .catch((err) => {
        console.error('Error: ' + err);
        process.exit();
      });

  });
}

/**
 * Get application info from prompt
 * @returns {Promise}
 */
function getAppInfo() {
  return new Promise((resolve, reject) => {
    console.log('Please enter an application information:');
    prompt(questions)
      .then((data) => {

        metadata.name = data.name;
        metadata.description = data.description;
        metadata.version = data.version;
        metadata.maintainer = data.maintainer;

        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * Download sample project from Github
 * @returns {Promise}
 */
function downloadSampleDApp() {
  return new Promise((resolve, reject) => {

    let options = {
      method: 'GET',
      url: APPLICATION.GITHUB_LINK
    }

    let responseStream = request(options);

    responseStream.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        reject('could not connect to github. check download link for sample project');
      } else if (err.code === 'ENOTFOUND') {
        reject('could not connect to github');
      } else {
        reject('status code: ' + err.code);
      }
    });

    responseStream.on('response', (response) => {
      if (response.statusCode == 200) {
        console.log('creating your dAPP...');
        responseStream
          .pipe(fs.createWriteStream(APPLICATION.ZIP_FILE))
          .on('finish', () => {
            resolve();
          });
      }
    });

  });
}

/**
 * Extract downloaded zip folder in current directory
 * @returns {Promise}
 */
function extractZip() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(APPLICATION.ZIP_FILE)
      .pipe(unzip.Extract({
        path: '.'
      }))
      .on('close', () => {
        resolve();
      });
  });
}

/**
 * Rename folder to application name
 * @returns {Promise}
 */
function renameSampleApp() {
  return new Promise((resolve, reject) => {
    const oldName = APPLICATION.REPO_NAME + '-master';
    fs.rename(oldName, metadata.name, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

/**
 * Write metadata.json file in application folder
 * @returns {Promise}
 */
function writeMetadata() {
  return new Promise((resolve, reject) => {
    const target = path.join(metadata.name, APPLICATION.METADATA_FILE);
    fs.writeFile(target, JSON.stringify(metadata), (err) => {
      if (err) {
        return reject(err);
      }
      resolve('cd ' + metadata.name + ' \nLearn STRATO and Solidity development at https://blockapps.net/training');
    });
  });
}

/**
 * Detele zip file created in User's home directory /strato
 */
function deleteZip() {
  return new Promise((resolve, reject) => {
    const target = path.join(APPLICATION.ZIP_FILE);
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

createSample();