const path = require("path");
const fs = require("fs");
const rp = require("request-promise");
const yaml = require("js-yaml");
const utils = require("./utils");
const config_command = require("./config");
const { APPLICATION, API_ENDPOINTS } = require("./properties");

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
          "In order to configure your bloc environment, you must enter your information below."
        );
        console.log(
          "Note: if you have already completed this step, make sure that your ./bloc directory contains a config.yaml file."
        );
        config_command
          .main()
          .then(() => {
            getBalance();
          })
          .catch(err => {
            console.error(err);
          });
      } else {
        getBalance();
      }
    });
}

/**
 * Entry point for the bloc balance command
 */
function getBalance() {
  try {
    // load config.yaml file
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

    let indentedJson = JSON.stringify(config, null, 4);
    let host = JSON.parse(indentedJson).hostAddr;

    rp(
      host +
        API_ENDPOINTS.BLOC_GET_USER_ADDRESS +
        JSON.parse(indentedJson).username
    )
      .then(response => {
        // if balance exists (account facuet completed)
        if (JSON.parse(response).length > 0) {
          let options = {
            uri: host + API_ENDPOINTS.STRATO_GET_BALANCE,
            qs: {
              address: JSON.parse(response)[0]
            }
          };

          rp(options).then(balance => {
            if (JSON.parse(balance).length > 0) {
              console.log(
                "Balance for %s (%s): %s",
                JSON.parse(indentedJson).username,
                JSON.parse(response)[0],
                JSON.parse(balance)[0].balance
              );
            } else {
              console.log(
                "Balance for %s (%s): NIL",
                JSON.parse(indentedJson).username,
                JSON.parse(response)[0]
              );
              console.log("try account faucet");
            }
          });
        } else {
          console.log(
            "username not found. try running bloc config to modify username"
          );
        }
      })
      .catch(err => {
        if (err.error.code === "ECONNREFUSED") {
          console.error('host unreachable or connection refused. try running bloc config to modify host address');
        } else {
          console.error("error occured with code " + err.error.code);
        }
      });
  } catch (err) {
    console.error(err);
  }
}

main();
