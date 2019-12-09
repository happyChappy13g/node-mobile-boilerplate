import fs from 'fs';
import path from 'path';

function trimAllStrings(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = typeof obj[key] === 'string' ? obj[key].trim() : obj[key];
    return acc;
  }, {});
}

function readdirSyncRec(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? readdirSyncRec(path.join(dir, file) + '/', filelist)
      : [...filelist, path.join(dir, file)];
  });
  return filelist;
}

module.exports = {readdirSyncRec, trimAllStrings};
