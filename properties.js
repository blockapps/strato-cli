module.exports = {
  APPLICATION: {
    APPLICATION_VERSION: "0.9.0",
    HOME_PATH:
      process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
    CONFIG_FOLDER: "strato",
    CONFIG_FILE: "config.yaml",
    METADATA_FILE: "metadata.json",
    ZIP_FILE: "strato.zip",
    REPO_NAME: "sample-zip",
    GITHUB_LINK: "https://github.com/blockapps/sample-zip/archive/master.zip",
    TESTNET: "http://stratodev.blockapps.net/"
  },
  API_ENDPOINTS: {
    BLOC_GET_USER_ADDRESS: "/bloc/v2.2/users/",
    APEX_UPLOAD_ZIP: "/apex-api/dapps",
    STRATO_GET_BALANCE: "/strato-api/eth/v1.2/account"
  }
};
