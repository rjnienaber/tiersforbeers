const debug = require('debug')('tiersforbeers:locations_processor');
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
    const feedFileTime = await getFeedFileTime(this.feedFilePath);
    debug(`Retrieved feed file time: '${feedFileTime}'`);
    return feedFileTime;
  }

  async createDatabase() {
    if (!this.cachedDb) {
      this.cachedDb = await createDatabase(this.config);
    }
    return this.cachedDb;
  }

  async checkChangedLocations() {
    debug(`Checking: ${this.postalCodes.length} postal codes`);
    const checkedPostalCodes = await checkPostalCodes(this.postalCodes, this.config);
    const locations = this.queryStringLocations.map((q) => ({ ...q, ...checkedPostalCodes[q.postalCode] }));

    const db = await this.createDatabase();
    const changedLocations = await db.locations.updateLocations(locations);
    debug(`Number of changed locations: ${changedLocations.length}`);

    const result = changedLocations.length > 0;
    debug(`Changed locations: ${result}`);

    if (result) {
      await db.logs.updateLogs(changedLocations);
    }

    return result;
  }

  async updateFeedFileTime() {
    return await updateFeedFileTime(this.feedFilePath);
  }

  async createFeedFile() {
    debug(`Creating new feed file at ${this.feedFilePath}`);
    const db = await this.createDatabase();
    const latestLogs = await db.logs.latest(this.postalCodes);
    const feedFileContent = generateFeedFile(latestLogs, this.config);
    await fs.writeFile(this.feedFilePath, feedFileContent);
  }

  async close() {
    if (this.cachedDb) {
      await this.cachedDb.close();
    }
  }
}

module.exports = {
  LocationsProcessor,
};
