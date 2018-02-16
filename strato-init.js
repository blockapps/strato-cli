#!/usr/bin/env node --harmony
const program = require("commander");
const { prompt } = require("inquirer");
const request = require("request");
const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");
const utils = require("./utils");
const config_command = require("./config");
const { APPLICATION } = require("./properties");

// prompt questions for strato init with validation are declared here
var questions = [
  {
    type: "input",
    name: "name",
    message: "app title: ",
    validate: value => {
      let reg = /^[a-zA-Z]*$/;
      if (!value) return "title required";
      if (value) {
        if (value.length > 20)
          return "app title must be less than 20 characters";
        else if (fs.existsSync(value))
          return "app with title " + value + " already exists";
        else if (!value.match(reg)) return "title can only include letters ";
        else return true;
      }
    }
  },
  {
    type: "input",
    name: "description",
    message: "app description: ",
    validate: value => {
      if (value) {
        if (value.length > 50)
          return "app description must be less than 50 characters";
        return true;
      }
      return "description required";
    }
  },
  {
    type: "input",
    name: "version",
    message: "version: ",
    validate: value => {
      // let reg = /^\$?(([1-9]\d{0,2}(,\d{3})*)|0)?\.\d{1,2}$/; this is a regex for USD price
      let reg = /^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/;
      if (!value) return "version number required";
      if (!value.match(reg)) return "please enter a valid number";
      return true;
    }
  },
  {
    type: "input",
    name: "maintainer",
    message: "email: ",
    validate: value => {
      let reg = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
      if (!value) return "email id required";
      if (!value.match(reg)) return "please enter a valid email address";
      return true;
    }
  }
];

// empty metadata.json object
var metadata = {
  name: null,
  description: null,
  version: null,
  maintainer: null
};

/**
 * Entry point for the strato init command
 */
function main() {
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
          "In order to configure your strato environment, you must enter your information below."
        );
        console.log(
          "Note: if you have already completed this step, make sure that your ./strato directory contains a config.yaml file."
        );
        config_command
          .main()
          .then(() => {
            console.log("Please enter an application information:");
            getDetails();
          })
          .catch(err => {
            console.error(err);
          });
      } else {
        console.log("Please enter an application information:");
        getDetails();
      }
    });
}

function getDetails() {
  // call prompt questions
  prompt(questions)
    .then(data => {
      // fill metadata object
      metadata.name = data.name;
      metadata.description = data.description;
      metadata.version = data.version;
      metadata.maintainer = data.maintainer;

      // download zip from github link
      let response_stream = request(APPLICATION.GITHUB_LINK);

      response_stream.on("error", err => {
        if (err.code === "ENOTFOUND") {
          console.error(
            "Error: could not connect to STRATO. try running strato config to modify host address"
          );
        } else if (err.code === "ECONNREFUSED") {
          console.error(
            "Error: could not connect to the host. try running strato config to modify host address"
          );
        } else {
          console.error("Error: code " + err.code);
        }
      });

      response_stream.on("response", body => {
        if (body.statusCode == 200) {
          console.log("creating your dAPP....");

          response_stream
            .pipe(fs.createWriteStream(APPLICATION.ZIP_FILE))
            .on("finish", () => {
              try {
                let zip = new AdmZip(APPLICATION.ZIP_FILE);
                // extract zip
                zip.extractAllTo(".", true);

                // rename zip to app name
                fs.rename(
                  APPLICATION.REPO_NAME + "-master",
                  metadata.name,
                  () => {
                    // create metadata.json file
                    fs.writeFile(
                      path.join(metadata.name, APPLICATION.METADATA_FILE),
                      JSON.stringify(metadata),
                      err => {
                        if (err) {
                          console.error(err);
                        }
                        console.log(
                          "cd " +
                            metadata.name +
                            "\nLearn STRATO and Solidity development at https://blockapps.net/training"
                        );
                      }
                    );
                  }
                );

                // delete sample zip folder
                fs.unlink(APPLICATION.ZIP_FILE, err => {
                  if (err)
                    console.error("error deleting temporary zip folder " + err);
                });
              } catch (err) {
                if (err) console.error(err);
              }
            });
        } else {
          console.error(
            "error downloading sample project. returned error code " +
              body.statusCode
          );
        }
      });
    })
    .catch(err => {
      console.error(err);
      if (fs.exists(APPLICATION.ZIP_FILE)) {
        // delete sample zip folder on error
        fs.unlink(APPLICATION.ZIP_FILE, err => {
          if (err) console.error("error deleting temporary zip folder " + err);
        });
      }
    });
}

main();
