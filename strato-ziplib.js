const fs = require('fs');
const AdmZip = require('adm-zip');
const path = require("path");
const process = require("process");
const walk = require("walk");
/**
 * Create .zip file inside User's home directory /strato
 * @params dir String the directory to be zipped up in full.
 * @params target String output filename for the zip file.
 * @returns {Promise}
 */

function zipFolder(dir, target) {
  return new Promise((resolve, reject) => {
      const walker = walk.walk(path.resolve(dir));
      const zip = new AdmZip();
      const cwd = process.cwd();
      walker.on("file", function(root, fileStats, next) {
        const absPath = path.join(root, fileStats.name);
        zip.addLocalFile(absPath, path.relative(dir, absPath));
        next();
      });
      walker.on('errors', reject);
      walker.on('end', async () => {
        zip.writeZip(target);
        resolve();
      });
  });
}

module.exports.zipFolder = zipFolder
