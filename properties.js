const APPLICATION = {
  HOME_PATH: process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
  CONFIG_FOLDER: 'strato',
  CONFIG_FILE: 'config.yaml',
  METADATA_FILE: 'metadata.json',
  ZIP_FILE: 'strato.zip',
  REPO_NAME: 'sample-zip',
  GITHUB_LINK: 'https://github.com/blockapps/sample-zip/archive/master.zip',
  TESTNET: 'https://stratodemo.blockapps.net/'
}

const API_ENDPOINTS = {
  BLOC_GET_USER_ADDRESS: '/bloc/v2.2/users/',
  APEX_UPLOAD_ZIP: '/apex-api/dapps',
  STRATO_GET_BALANCE: '/strato-api/eth/v1.2/account'
}

module.exports.APPLICATION = APPLICATION;
module.exports.API_ENDPOINTS = API_ENDPOINTS;
