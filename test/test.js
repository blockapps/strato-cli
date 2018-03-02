const chai = require('chai');
const assert = chai.assert;
const mktemp = require('mktemp');
const fs = require('fs-extra');
const rimraf = require('rimraf');
const path = require('path');
const zip = require('../strato-ziplib');

describe('StratoCli', () => {
  it("Zips up project directories", async () => {
    let outputDir;
    try {
      assert(fs.existsSync('./test/testdata'));
      fs.mkdirp('./tmp');
      outputDir = mktemp.createDirSync('./tmp/strato-cli-test-XXXXXX');
      const filename = path.join(outputDir, "bundle.zip");
      await zip.zipFolder('./test/testdata', filename);
      assert(fs.existsSync(filename));
    } catch (error) {
      throw error;
    } finally {
      console.log("outputDir: " + outputDir);
      rimraf.sync(outputDir);
    }
  });
});
