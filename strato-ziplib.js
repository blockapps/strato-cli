const zipdir = require('zip-dir');

/**
 * Create .zip file inside User's home directory /strato
 * @params dir String the directory to be zipped up in full.
 * @params target String output filename for the zip file.
 * @returns {Promise}
 */

function zipFolder(dir, target) {
  return new Promise((resolve, reject) => {
      zipdir(dir, {saveTo: target}, function (err, buffer) {
        if (err) {
          reject(err);
        }
        resolve();
      });
  });
}

module.exports.zipFolder = zipFolder
