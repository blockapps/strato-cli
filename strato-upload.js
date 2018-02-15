#!/usr/bin/env node --harmony
const { prompt } = require("inquirer");
const program = require("commander");
const rp = require("request-promise");
const AdmZip = require("adm-zip");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const config_command = require("./config");
const utils = require("./utils");
const { APPLICATION, API_ENDPOINTS } = require("./properties");

program.arguments("<dir>").action(dir => {
  dirValue = dir;

  // check if config.yaml exists
  utils
    .fsFileExistsSync(
      path.join(
        APPLICATION.HOME_PATH,
        APPLICATION.CONFIG_FOLDER,
        APPLICATION.CONFIG_FILE
      )
    )
    .then(result => {
      if (!result) {
        console.log(
          "In order to configure your bloc environment, you must enter your information below."
        );
        console.log(
          "Note: if you have already completed this step, make sure that your ./bloc directory contains a config.yaml file."
        );

        // create configuration file
        config_command.main().then(() => {
          console.log("Please enter an application information:");
          main();
        });
      } else {
        main();
      }
    });
});

program.parse(process.argv);

// check if <dir> attribute is passed or not
if (typeof dirValue === "undefined") {
  console.error(
    "directory path required with respect to home folder! Please refer to bloc --help"
  );
}

/**
 * Entry point for the bloc upload command
 */
function main() {
  // check if app with title exists or not
  utils
    .fsDirExistsSync(path.join(APPLICATION.HOME_PATH, dirValue))
    .then(result => {
      if (result) {
        // logic to validate content of provided folder
        fs.readdir(path.join(APPLICATION.HOME_PATH, dirValue), (err, items) => {
          if (err) {
            console.error(err);
          }

          // <---------------- START logic for deleting hidden files in application folder ---------------->

          // delete hidden system files like .DS_Store on mac
          // this is a performance bottleneck. Can be optimized in future.

          // if (/^\..*/.test(items)) {
          //   items.forEach(item => {
          //     if (/^\..*/.test(item)) {
          //       fs.unlinkSync(path.join(APPLICATION.HOME_PATH, dirValue, item));
          //     }
          //   });
          // }

          // <---------------- END logic for deleting hidden files in application folder ------------------>

          // check folder structure
          // -> contracts -> .sol file(s)
          // -> index.html
          // -> metadata.json
          if (!items.includes("metadata.json")) {
            console.error("missing metadata.json file");
          } else if (!items.includes("index.html")) {
            console.error("missing index.html file");
          } else if (items.includes("contracts")) {
            // check for the content of contracts folder if exists
            fs.readdir(
              path.join(APPLICATION.HOME_PATH, dirValue, "contracts"),
              (err, list) => {
                if (err) {
                  console.error(err);
                }
                let nonSolFileExists = false;
                list.forEach(file => {
                  // test cases to delete hidden files and check only for .sol extension files
                  // extension checking can be improved in future
                  if (/^\..*/.test(file)) {
                    console.error(
                      "there are some hidden files in the contracts folder"
                    );
                    nonSolFileExists = true;

                    // <---------------- START logic for deleting hidden files in contracts folder ---------------->

                    // delete hidden file(s)
                    // fs.unlinkSync(
                    //   path.join(APPLICATION.HOME_PATH, dirValue, file)
                    // );

                    // <---------------- END logic for deleting hidden files in contracts folder ------------------>
                  }
                  if (path.extname(file) !== ".sol") {
                    nonSolFileExists = true;
                  }
                });

                // throw error if there are some other files in contracts folder including hidden files
                if (!nonSolFileExists) {
                  zipFolder(dirValue)
                    .then(() => {
                      uploadZip();
                    })
                    .catch(err => {
                      if (
                        fs.existsSync(
                          path.join(
                            APPLICATION.HOME_PATH,
                            APPLICATION.CONFIG_FOLDER,
                            APPLICATION.ZIP_FILE
                          )
                        )
                      ) {
                        fs.unlinkSync(
                          path.join(
                            APPLICATION.HOME_PATH,
                            APPLICATION.CONFIG_FOLDER,
                            APPLICATION.ZIP_FILE
                          )
                        );
                      }
                      console.error(err);
                    });
                } else {
                  console.error(
                    "contracts folder should only contain .sol file(s)"
                  );
                }
              }
            );
          } else {
            console.error("missing contracts folder");
          }
        });
      } else {
        console.error(
          "no dApp found with name " + dirValue + "in respect to home folder"
        );
      }
    });
}

/**
 * Create .zip file inside User's home directory /bloc
 * @returns {Promise}
 */

function zipFolder(dir) {
  return new Promise((resolve, reject) => {
    try {
      let zip = new AdmZip();
      zip.addLocalFolder(path.join(APPLICATION.HOME_PATH, dir, path.sep));
      zip.writeZip(
        path.join(
          APPLICATION.HOME_PATH,
          APPLICATION.CONFIG_FOLDER,
          APPLICATION.ZIP_FILE
        )
      );
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

var data = {
  username: null,
  address: null,
  password: null,
  hostAddr: null
};

/**
 * Upload zip to apex server
 */
function uploadZip() {
  try {
    // read config.yaml file
    const config = yaml.safeLoad(
      fs.readFileSync(
        path.join(
          APPLICATION.HOME_PATH,
          APPLICATION.CONFIG_FOLDER,
          APPLICATION.CONFIG_FILE
        ),
        "utf8"
      )
    );

    // set username from config.yaml file
    let intendedJSON = JSON.stringify(config, null, 4);
    data.username = JSON.parse(intendedJSON).username;
    data.hostAddr = JSON.parse(intendedJSON).hostAddr;

    // call bloc api get user address from username
    rp(data.hostAddr + API_ENDPOINTS.BLOC_GET_USER_ADDRESS + data.username)
      .then(response => {
        // check if user exists
        if (JSON.parse(response).length > 0) {
          data.address = JSON.parse(response)[0];

          // get password for the user
          getPassword().then(answer => {
            data.password = answer.password;

            let options = {
              method: "POST",
              uri: data.hostAddr + API_ENDPOINTS.APEX_UPLOAD_ZIP,
              formData: {
                username: data.username,
                password: data.password,
                address: data.address,
                file: {
                  value: fs.createReadStream(
                    path.join(
                      APPLICATION.HOME_PATH,
                      APPLICATION.CONFIG_FOLDER,
                      APPLICATION.ZIP_FILE
                    )
                  ),
                  options: {
                    filename: APPLICATION.ZIP_FILE,
                    contentType: "application/zip"
                  }
                }
              }
            };

            console.log('uploading...');
            // call apex api to upload zip file and delete file after that
            rp(options)
              .then(body => {
                fs.unlinkSync(
                  path.join(
                    APPLICATION.HOME_PATH,
                    APPLICATION.CONFIG_FOLDER,
                    APPLICATION.ZIP_FILE
                  )
                );
                console.log(
                  "application successfully deployed with url %s",
                  JSON.parse(body).url
                );
              })
              .catch(err => {
                fs.unlinkSync(
                  path.join(
                    APPLICATION.HOME_PATH,
                    APPLICATION.CONFIG_FOLDER,
                    APPLICATION.ZIP_FILE
                  )
                );
                console.log(JSON.parse(err.error).error.message);
              });
          });
        } else {
          console.log(
            "username not found. try running bloc config to modify username or host address"
          );
        }
      })
      .catch(err => {
        if (err.error.code === "ECONNREFUSED") {
          console.error(
            "host unreachable or connection refused. try running bloc config to modify host address"
          );
        } else {
          console.error("error occured with code " + err.error.code);
        }
      });
  } catch (err) {
    console.error(err);
  }
}

/**
 * Get password
 * @returns {Promise}
 */
function getPassword() {
  return new Promise((resolve, reject) => {
    prompt({
      type: "password",
      name: "password",
      message: "password: ",
      validate: value => {
        if (!value) return "password required";
        return true;
      }
    })
      .then(answer => {
        resolve(answer);
      })
      .catch(err => {
        reject(err);
      });
  });
}
