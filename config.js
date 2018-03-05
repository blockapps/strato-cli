const { prompt } = require("inquirer");
const yaml = require("write-yaml");
const path = require("path");
const { APPLICATION } = require("./properties");

// prompt questions for strato config command
var username = [
  {
    type: "input",
    name: "username",
    message: "username: ",
    validate: value => {
      // validation for username. can't contain only numbers, special characters and length should be between 6 to 20.
      let reg = /^(\d*[a-zA-Z]\d*)+$/;
      if (!value) return "username required";
      // if (!value.match(reg) || value.length < 6 || value.length > 20)
      if (!value.match(reg))
        return "username cannot contain only numbers, special characters and should be between 6 and 20";
      return true;
    }
  }
];

var hostname = [
  {
    type: "input",
    name: "hostAddr",
    message: "host IP or DNS address (with http:// || https://): ",
    validate: value => {
      // validation for IP address.
      // let reg = /^(http|https):\/\/((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!value) return "host IP address required";
      // if (!value.match(reg)) return "please enter a valid IP address";
      return true;
    }
  }
];

// config.yaml skeleton
var config = {
  username: null,
  hostAddr: null
};

/**
 * Entry point for the strato config command
 * @returns {Promise}
 */
function main() {
  return new Promise((resolve, reject) => {
    console.log("Please enter the configuration information:");
    getUsername()
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * Call prompt to get username
 * @returns {Promise}
 */
function getUsername() {
  return new Promise((resolve, reject) => {
    prompt(username).then(data => {
      // set username
      config.username = data.username;

      console.log("Press [ ENTER ] for Default Host");
      console.log("Press [ SPACE ] for Custom Host");

      // program halts to capture ENTER || SPACE || CTRL + C keys from Keyboard input
      captureKeys().then(key => {
        if (key === "ENTER") {
          // set host address to default value
          config.hostAddr = APPLICATION.TESTNET;
          generateFile()
            .then(() => {
              resolve();
            })
            .catch(err => {
              reject(err);
            });
        } else if (key === "SPACE") {
          getHostAddress()
            .then(() => {
              resolve();
            })
            .catch(err => {
              reject(err);
            });
        }
      });
    });
  });
}

/**
 * Get Host Address
 * @returns {Promise}
 */
function getHostAddress() {
  return new Promise((resolve, reject) => {
    prompt(hostname)
      .then(data => {
        config.hostAddr = data.hostAddr;
        resolve(generateFile());
      })
      .catch(err => {
        reject(err);
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
    stdin.setEncoding("utf8");
    stdin.addListener("data", key => {
      if (key === "\u000D") {
        stdin.pause();
        stdin.removeAllListeners("data");
        resolve("ENTER");
      } else if (key === "\u0020") {
        stdin.pause();
        stdin.removeAllListeners("data");
        resolve("SPACE");
      } else if (key === "\u0003") {
        process.exit();
      }
    });
  });
}

/**
 * Generate 'strato' folder in User's home directory and generate config.yaml file
 * @returns {Promise}
 */
function generateFile() {
  return new Promise((resolve, reject) => {
    yaml(
      path.join(
        APPLICATION.HOME_PATH,
        APPLICATION.CONFIG_FOLDER,
        APPLICATION.CONFIG_FILE
      ),
      config,
      err => {
        if (err) return reject(err);
        console.log("Configuration file has been saved");
        resolve();
      }
    );
  });
}

module.exports.main = main;
