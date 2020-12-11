const path = require('path');

const dataDir = path.resolve(path.join(__dirname, '..', '.data'));
const databaseFilePath = path.join(dataDir, 'db.sqlite');

let appUrl = '';

// use project name from glitch to get hosted url
if (process.env.PROJECT_DOMAIN) {
  appUrl = `https://${process.env.PROJECT_DOMAIN}.glitch.me`
}

const config = {
  dataDir,
  databaseFilePath,
  appUrl,
  govUk: {
    url: 'https://www.gov.uk/find-coronavirus-local-restrictions',
  },
  feed: {
    size: 10,
  },
};

module.exports = config;
