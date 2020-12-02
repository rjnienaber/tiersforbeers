const { expect } = require('chai');
const { back: nockBack } = require('nock');
const path = require('path');
const { checkPostalCode } = require('../src/apis');

nockBack.fixtures = path.resolve(path.join(__dirname, 'fixtures'));
nockBack.setMode('record'); // https://github.com/nock/nock#modes

async function runPostalCodeCheck(cachedFile, postalCode) {
  return await new Promise((resolve, reject) => {
    nockBack(cachedFile, async (done) => {
      try {
        const result = await checkPostalCode(postalCode);
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        done();
      }
    });
  });
}

describe('apis', () => {
  describe('#checkPostalCode', () => {
    it('retrieves details for Baker Street', async () => {
      const result = await runPostalCodeCheck('check_baker_street.json', 'NW1 6XE');
      expect(result).to.deep.equal({
        council: 'City of Westminster',
        tier: 'Tier 2: High alert',
      });
    });

    it('retrieves details for Coronation Street', async () => {
      const result = await runPostalCodeCheck('check_coronation_street.json', 'M50 2EQ');
      expect(result).to.deep.equal({
        council: 'Salford City Council',
        tier: 'Tier 3: Very High alert',
      });
    });

    it('returns undefined for nonsense address', async () => {
      const result = await runPostalCodeCheck('check_invalid_postcode.json', 'BLAH BLAH');
      expect(result).to.be.undefined;
    });
  });
});
