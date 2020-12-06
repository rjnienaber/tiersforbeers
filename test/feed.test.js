const {updateFeedFileTime} = require('../src/feed')
const {getFeedFileTime} = require('../src/feed')
const chai = require('chai');
const { expect } = require('chai');
const {promises: fs} = require('fs');
const { generateFeedFilePath } = require('../src/feed');
const {file } = require('tmp-promise');
const chaiDateTime = require('chai-datetime');


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
      cleanup = tmpFile.cleanup
      path = tmpFile.path;
    })

    afterEach(async () => {
      if (cleanup) {
        await cleanup();
      }
    })

    describe('#getFeedFileTime', () => {
      it('returns "current" when made today', async () => {
        const result = await getFeedFileTime(path);
        expect(result).to.equal('current');
      })

      it('returns "outdated" when older than today', async () => {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        await fs.utimes(path, yesterday, yesterday)

        const result = await getFeedFileTime(path);
        expect(result).to.equal('outdated');
      })

      it('returns "absent" when missing', async () => {
        await cleanup();
        cleanup = undefined; // can only be used once

        const result = await getFeedFileTime(path);
        expect(result).to.equal('absent');
      })
    })

    it('#updateFeedFileTime', async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      await fs.utimes(path, yesterday, yesterday)

      await updateFeedFileTime(path);

      const stat = await fs.stat(path);
      expect(stat.atime).to.be.closeToTime(now, 1);
      expect(stat.mtime).to.be.closeToTime(now, 1);
    });
  })
});
