const chai = require('chai');
const { expect } = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { createDatabase } = require('../src/database');

chai.use(chaiAsPromised);

const potter = {
  name: 'Beatrix Potter',
  postalCode: 'LA220LF',
  council: 'South Lakeland District Council',
  tier: 'Tier 2: High alert',
};

describe('database', () => {
  let db;
  let holmes;
  beforeEach(async () => {
    db = await createDatabase();
    holmes = {
      name: 'Sherlock Holmes',
      postalCode: 'NW16XE',
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

    it('#updateLocations', async () => {
      await db.locations.create(potter);
      await db.locations.create(holmes);
      holmes.tier = 'Tier 3: Very High alert';

      const kennedy = {
        name: 'Kevin Kennedy',
        postalCode: 'M502EQ',
        council: 'Salford City Council',
        tier: 'Tier 3: Very High alert',
      };

      const result = await db.locations.updateLocations([potter, holmes, kennedy]);
      expect(result.length).to.equal(2);

      const [savedHolmes, savedKennedy] = result;

      expect(savedHolmes.postalCode).to.equal(holmes.postalCode);
      expect(savedHolmes.tier).to.equal(holmes.tier);

      expect(savedKennedy.postalCode).to.equal(kennedy.postalCode);
      expect(savedKennedy.tier).to.equal(kennedy.tier);

      const allLocations = await db.locations.findAll();
      expect(allLocations.length).to.equal(3);
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

    it('#uploadLogs', async () => {
      const locations = await db.locations.updateLocations([potter, holmes]);
      await db.logs.updateLogs(locations);

      const savedLog = await db.logs.findAll();
      expect(savedLog.length).to.equal(2);

      expect(savedLog[0].tier).to.equal(potter.tier);
      expect(savedLog[1].tier).to.equal(holmes.tier);
    });

    it('retrieves latest rows from log', async () => {
      const location = await db.locations.create(holmes);
      const potterLocation = await db.locations.create(potter);

      const logs = [...Array(20).keys()].map((_, i) => ({ tier: `Tier ${i}`, locationId: location.id }));
      await db.logs.bulkCreate(logs);
      await db.logs.create({ tier: 'Tier Potter', locationId: potterLocation.id });

      const latestLogs = await db.logs.latest(location.postalCode);
      const ids = latestLogs.map((log) => log.id);
      expect(ids).to.deep.equal([20, 19, 18, 17, 16, 15, 14, 13, 12, 11]);

      const log = latestLogs[0];
      expect(log.location).to.not.equal(undefined);
      expect(log.location.id).to.equal(location.id);
    });
  });
});
