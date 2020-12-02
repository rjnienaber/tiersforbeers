const { expect } = require('chai');
const { createDatabase } = require('../src/database');

describe('database', () => {
  describe('#locations', () => {
    let db;
    beforeEach(async () => {
      db = await createDatabase();
    });

    afterEach(async () => {
      await db.close();
    });

    it('saves one status', async () => {
      const location = {
        name: 'Sherlock Holmes',
        postalCode: 'NW1 6XE',
        council: 'City of Westminster',
        tier: 'Tier 2: High alert',
      };

      await db.locations.create(location);

      const savedStatus = await db.locations.findOne({ where: { id: 1 } });

      expect(savedStatus.id).to.not.equal(null);
      expect(savedStatus.name).to.equal(location.name);
      expect(savedStatus.postalCode).to.equal(location.postalCode);
      expect(savedStatus.council).to.equal(location.council);
      expect(savedStatus.tier).to.equal(location.tier);
      expect(savedStatus.updatedAt).to.not.equal(null);
      expect(savedStatus.created_at).to.not.equal(null);
    });

    it('perform upsert', async () => {
      const holmes = {
        name: 'Sherlock Holmes',
        postalCode: 'NW1 6XE',
        council: 'City of Westminster',
        tier: 'Tier 2: High alert',
      };

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
});
