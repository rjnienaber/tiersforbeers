const path = require('path');

const appDir = path.resolve(path.join(__dirname, '..'));
const dataDir = path.join(appDir, '.data');

const databaseFilePath = path.join(dataDir, 'db.sqlite');
const readmeFilePath = path.join(appDir, 'README.md');

let appUrl = '';

// use project name from glitch to get hosted url
if (process.env.PROJECT_DOMAIN) {
  appUrl = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

const config = {
  appDir,
  dataDir,
  databaseFilePath,
  readmeFilePath,
  appUrl,
  govUk: {
    url: 'https://www.gov.uk/find-coronavirus-local-restrictions',
  },
  feed: {
    size: 10,
  },
};

module.exports = config;
