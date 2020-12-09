const path = require('path');

const dataDir = path.resolve(path.join(__dirname, '..', '.data'));
const databaseFilePath = path.join(dataDir, 'db.sqlite');

const config = {
  dataDir,
  databaseFilePath,
  appUrl: process.env.PROJECT_DOMAIN,
  govUk: {
    url: 'https://www.gov.uk/find-coronavirus-local-restrictions',
  },
  feed: {
    size: 10,
  },
};

module.exports = config;
