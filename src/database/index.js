const Sequelize = require('sequelize');
const {defineLocation} = require('./location')
const debug = require('debug')('database')

async function createDatabase(filePath, enableLogging = false) {
  debug(`Database file path: ${filePath}`);
  const storage = filePath ? filePath : undefined; // undefined = memory
  const options = { logging: enableLogging, dialect: 'sqlite', storage };
  debug(`Database options %O`, options)

  const sequelize = new Sequelize(options);
  await sequelize.authenticate();
  const db = new Database(sequelize);
  await db.sync();

  return db;
}

class Database {
  constructor (sequelize) {
    this.sequelize = sequelize;
    this.locations = defineLocation(sequelize);
  }

  async sync() {
    return await this.locations.sync({force: true});
  }

  async close() {
    return await this.sequelize.close();
  }
}

module.exports = {
  Database,
  createDatabase
};
