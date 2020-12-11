const chai = require('chai');
const { expect } = require('chai');
const { promises: fs } = require('fs');
const { file } = require('tmp-promise');
const chaiDateTime = require('chai-datetime');
const config = require('../src/config');
const { createDatabase } = require('../src/database');
const { generateFeedFilePath, getFeedFileTime, generateFeedFile, updateFeedFileTime } = require('../src/feed');

chai.use(chaiDateTime);

describe('feed', () => {
  it('#generateFeedFilePath', () => {
    const locations = [
      { name: 'Sherlock Holmes', postalCode: 'NW16XE' },
      { name: 'Beatrix Potter', postalCode: 'LA220LF' },
    ];

    const feedFilePath = generateFeedFilePath('/tmp', locations);
    expect(feedFilePath).to.equal('/tmp/feed_la220lf_nw16xe.xml');
  });

  describe('#feed file times', () => {
    let cleanup;
    let path;

    beforeEach(async () => {
      const tmpFile = await file();
      cleanup = tmpFile.cleanup;
      path = tmpFile.path;
    });

    afterEach(async () => {
      if (cleanup) {
        await cleanup();
      }
    });

    describe('#getFeedFileTime', () => {
      it('returns "current" when made today', async () => {
        const result = await getFeedFileTime(path);
        expect(result).to.equal('current');
      });

      it('returns "outdated" when older than today', async () => {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        await fs.utimes(path, yesterday, yesterday);

        const result = await getFeedFileTime(path);
        expect(result).to.equal('outdated');
      });

      it('returns "absent" when missing', async () => {
        await cleanup();
        cleanup = undefined; // can only be used once

        const result = await getFeedFileTime(path);
        expect(result).to.equal('absent');
      });
    });

    it('#updateFeedFileTime', async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      await fs.utimes(path, yesterday, yesterday);

      await updateFeedFileTime(path);

      const stat = await fs.stat(path);
      expect(stat.atime).to.be.closeToTime(now, 1);
      expect(stat.mtime).to.be.closeToTime(now, 1);
    });

    describe('#generateFeedFile', () => {
      let db;
      beforeEach(async () => {
        db = await createDatabase({ databaseFilePath: '', feed: { size: 10 } });
      });

      afterEach(async () => {
        if (db) {
          await db.close();
        }
      });

      it('generates xml file', async () => {
        db = await createDatabase({ databaseFilePath: '', feed: { size: 10 } });
        const holmes = {
          name: 'Sherlock Holmes',
          postalCode: 'NW16XE',
          council: 'City of Westminster',
          tier: 'Tier 2: High alert',
        };
        const locations = await db.locations.updateLocations([holmes]);
        await db.logs.updateLogs(locations);
        const latestLogs = await db.logs.latest(holmes.postalCode);

        const testConfig = { ...config, appUrl: 'http://localhost:8000' };

        const now = new Date();
        const xml = await generateFeedFile(latestLogs, testConfig);
        const getElement = (tag) => new RegExp(`<${tag}>(.+)</${tag}>`).exec(xml)[1];

        // channel
        expect(xml).to.contains('<title>Tier Changelog</title>');
        expect(xml).to.contains('<link>http://localhost:8000/rss.xml</link>');
        expect(new Date(getElement('lastBuildDate'))).to.be.closeToTime(now, 1);
        expect(xml).to.contains('<generator>https://github.com/rjnienaber/tiersforbeers</generator>');
        expect(xml).to.contains('<copyright>Copyright (C) 2020 Richard Nienaber</copyright>');
        expect(xml).to.contains(
          '<description>The list of covid-19 tier changes for the following postal codes: NW16XE</description>',
        );
        expect(xml).to.contains(
          '<atom:link href="http://localhost:8000/rss.xml" rel="self" type="application/rss+xml"/>',
        );

        // item
        expect(xml).to.contains(
          "<title><![CDATA[Change detected for area 'Sherlock Holmes' (NW16XE): Tier 2: High alert]]></title>",
        );
        expect(xml).to.contains(`<link>${config.govUk.url}</link>`);
        expect(xml).to.contains('<guid>http://localhost:8000/1</guid>');
        expect(new Date(getElement('pubDate'))).to.be.closeToTime(now, 1);
        expect(xml).to.contains(
          "<description><![CDATA[A tier change has been detected for area 'Sherlock Holmes' (NW16XE), in the council 'City of Westminster'. The new tier is 'Tier 2: High alert']]></description>",
        );
      });
    });
  });
});
