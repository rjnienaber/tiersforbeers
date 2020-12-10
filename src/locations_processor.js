const { promises: fs } = require('fs');
const { updateFeedFileTime } = require('./feed');
const { generateFeedFile } = require('./feed');
const { checkPostalCodes } = require('./apis');
const { createDatabase } = require('./database');
const { getFeedFileTime } = require('./feed');
const { generateFeedFilePath } = require('./feed');
const { processQueryString } = require('./querystring_processor');

class LocationsProcessor {
  constructor(config, queryString) {
    this.config = config;
    this.queryStringLocations = processQueryString(queryString);
  }

  get feedFilePath() {
    if (!this.cachedFeedFilePath) {
      this.cachedFeedFilePath = generateFeedFilePath(this.config.dataDir, this.queryStringLocations);
    }

    return this.cachedFeedFilePath;
  }

  get postalCodes() {
    if (!this.cachedPostalCodes) {
      this.cachedPostalCodes = this.queryStringLocations.map((l) => l.postalCode);
    }

    return this.cachedPostalCodes;
  }

  async getFeedFileTime() {
    return await getFeedFileTime(this.feedFilePath);
  }

  async createDatabase() {
    if (!this.cachedDb) {
      this.cachedDb = await createDatabase(this.config.databaseFilePath);
    }
    return this.cachedDb;
  }

  async getChangedLocations() {
    const checkedPostalCodes = await checkPostalCodes(this.postalCodes, this.config);
    const locations = this.queryStringLocations.map((q) => ({ ...q, ...checkedPostalCodes[q.postalCode] }));

    const db = await this.createDatabase();
    return await db.locations.updateLocations(locations);
  }

  async updateFeedFileTime() {
    return await updateFeedFileTime(this.feedFilePath);
  }

  async createFeedFile(changedLocations) {
    const db = await this.createDatabase();
    await db.logs.updateLogs(changedLocations);
    const latestLogs = await db.logs.latest(this.postalCodes);
    const feedFileContent = generateFeedFile(latestLogs, this.config);
    await fs.writeFile(this.feedFilePath, feedFileContent);
  }
}

module.exports = {
  LocationsProcessor,
};
