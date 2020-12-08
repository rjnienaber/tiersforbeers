const chai = require('chai');
const { expect } = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { back: nockBack } = require('nock');
const path = require('path');
const { checkPostalCode } = require('../src/apis');
const config = require('../src/config');

chai.use(chaiAsPromised);

nockBack.fixtures = path.resolve(path.join(__dirname, 'fixtures'));
nockBack.setMode('record'); // https://github.com/nock/nock#modes

async function runPostalCodeCheck(cachedFile, postalCode) {
  return await new Promise((resolve, reject) => {
    nockBack(cachedFile, async (done) => {
      try {
        const result = await checkPostalCode(postalCode, config);
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

    it('throws error when no result for postal code', async () => {
      const promise = runPostalCodeCheck('check_invalid_postcode.json', 'BLAH BLAH');
      await expect(promise).to.eventually.be.rejectedWith("Unable to retrieve tier for postal code 'BLAH BLAH'");
    });
  });
});
