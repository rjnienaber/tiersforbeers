const chai = require('chai');
const { expect } = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { createDatabase } = require('../src/database');

chai.use(chaiAsPromised);

describe('database', () => {
  let db;
  let holmes;
  beforeEach(async () => {
    db = await createDatabase();
    holmes = {
      name: 'Sherlock Holmes',
      postalCode: 'NW1 6XE',
      council: 'City of Westminster',
      tier: 'Tier 2: High alert',
    };
  });

  afterEach(async () => {
    if (db) {
      await db.close();
    }
  });

  describe('#locations', () => {
    it('saves one status', async () => {
      await db.locations.create(holmes);

      const savedStatus = await db.locations.findOne({ where: { id: 1 } });

      expect(savedStatus.id).to.not.equal(null);
      expect(savedStatus.name).to.equal(holmes.name);
      expect(savedStatus.postalCode).to.equal(holmes.postalCode);
      expect(savedStatus.council).to.equal(holmes.council);
      expect(savedStatus.tier).to.equal(holmes.tier);
      expect(savedStatus.updatedAt).to.not.equal(null);
      expect(savedStatus.createdAt).to.not.equal(null);
    });

    it('perform upsert', async () => {
      await db.locations.create(holmes);
      holmes.tier = 'Tier 3: Very High alert';

      const kennedy = {
        name: 'Kevin Kennedy',
        postalCode: 'M50 2EQ',
        council: 'Salford City Council',
        tier: 'Tier 3: Very High alert',
      };

      await db.locations.upsert([holmes, kennedy]);

      const allStatuses = await db.locations.findAll();
      expect(allStatuses.length).to.equal(2);
      expect(allStatuses[0].tier).to.equal(holmes.tier);
      expect(allStatuses[1].tier).to.equal(kennedy.tier);
    });
  });

  describe('#log', () => {
    it('inserts log of location tier change', async () => {
      const location = await db.locations.create(holmes);
      const log = { tier: 'Tier 2: High alert', locationId: location.id };
      await db.logs.create(log);

      const savedLog = await db.logs.findOne({ where: { id: 1 }, include: ['location'] });

      expect(savedLog.id).to.not.equal(null);
      expect(savedLog.tier).to.equal(log.tier);
      expect(savedLog.createdAt).to.not.equal(null);
      expect(savedLog.locationId).to.equal(location.id);

      expect(savedLog.location.id).to.equal(location.id);
      expect(savedLog.location.name).to.equal(location.name);
      expect(savedLog.location.postalCode).to.equal(location.postalCode);

      expect(savedLog.updatedAt).to.equal(undefined);
    });

    it('requires existing location for foreign key', async () => {
      const log = { tier: 'Tier 2: High alert' };
      await expect(db.logs.create(log)).to.eventually.be.rejectedWith(
        'notNull Violation: log.locationId cannot be null',
      );
    });
  });
});
