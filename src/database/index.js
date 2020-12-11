const debug = require('debug')('tiersforbeers:database');
const Sequelize = require('sequelize');
const config = require('../config');
const { defineLocation } = require('./location');
const { defineLog } = require('./log');

class Database {
  constructor(sequelize, appConfig) {
    this.sequelize = sequelize;
    this.locations = defineLocation(sequelize);
    this.logs = defineLog(sequelize, this.locations, appConfig);
  }

  async sync() {
    await this.locations.sync();
    return await this.logs.sync();
  }

  async close() {
    return await this.sequelize.close();
  }
}

async function createDatabase(filePath, enableLogging = false) {
  debug(`Database file path: ${filePath}`);
  const options = { logging: enableLogging, dialect: 'sqlite', storage: filePath };
  debug('Database options %O', options);

  const sequelize = new Sequelize(options);
  await sequelize.authenticate();
  const db = new Database(sequelize, config);
  await db.sync();

  return db;
}

module.exports = {
  Database,
  createDatabase,
};
