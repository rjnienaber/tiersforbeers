const chai = require('chai');
const { expect } = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { back: nockBack } = require('nock');
const path = require('path');
const { checkPostalCode } = require('../src/apis');
const config = require('../src/config');
const { checkPostalCodes } = require('../src/apis');

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
      const result = await runPostalCodeCheck('check_baker_street.json', 'NW16XE');
      expect(result).to.deep.equal({
        council: 'City of Westminster',
        tier: 'Tier 2: High alert',
      });
    });

    it('retrieves details for Coronation Street', async () => {
      const result = await runPostalCodeCheck('check_coronation_street.json', 'M502EQ');
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

  describe('#checkPostalCodes', () => {
    it('returns a hash of results by postal code', async () => {
      const result = await new Promise((resolve, reject) => {
        nockBack('check_multiple_postal_codes.json', async (done) => {
          try {
            const result = await checkPostalCodes(['NW16XE', 'M502EQ'], config);
            resolve(result);
          } catch (err) {
            reject(err);
          } finally {
            done();
          }
        });
      });

      const expected = {
        NW16XE: {
          council: 'City of Westminster',
          tier: 'Tier 2: High alert',
        },
        M502EQ: {
          council: 'Salford City Council',
          tier: 'Tier 3: Very High alert',
        },
      };

      expect(result).to.deep.equal(expected);
    });
  });
});
