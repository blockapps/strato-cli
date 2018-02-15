const fs = require("fs");

module.exports = {
  /**
   * Synchronously checks if provided file exists or not
   * @param file {string}
   * @returns {Promise}
   */
  fsFileExistsSync: file => {
    return new Promise((resolve, reject) => {
      try {
        resolve(fs.statSync(file).isFile());
      } catch (err) {
        if (err.code === "ENOENT") {
          resolve(false);
        } else {
          reject(err);
        }
      }
    });
  },

  /**
   * Synchronously checks if provided folder exists or not
   * @param dir {string}
   * @returns {Promise}
   */
  fsDirExistsSync: dir => {
    return new Promise((resolve, reject) => {
      try {
        resolve(fs.statSync(dir).isDirectory());
      } catch (err) {
        if (err.code === "ENOENT") {
          resolve(false);
        } else {
          reject(err);
        }
      }
    });
  }
};
