const { expect } = require('chai');
const { processQueryString } = require('../src/querystring_processor');

describe('querystring parser', () => {
  describe('#processQueryString', () => {
    it('handles single postal code', () => {
      const locations = processQueryString({ 'Sherlock Holmes': ' Nw1 6xE ' });

      expect(locations).to.deep.equal([
        {
          name: 'Sherlock Holmes',
          postalCode: 'NW16XE',
        },
      ]);
    });

    it('handles multiple postal codes', () => {
      const locations = processQueryString({ 'Sherlock Holmes': ' NW1 6XE', 'Kevin Kennedy': 'M502EQ' });
      expect(locations).to.deep.equal([
        {
          name: 'Sherlock Holmes',
          postalCode: 'NW16XE',
        },
        {
          name: 'Kevin Kennedy',
          postalCode: 'M502EQ',
        },
      ]);
    });

    it('returns error for invalid postal code', () => {
      const qs = { 'No Name': 'Blah Blah' };
      expect(() => processQueryString(qs)).to.throw("Invalid postal code: 'Blah Blah'");
    });

    it('throws error for invalid postal code out of array of values', () => {
      const qs = { 'John Doe': 'Blah Blah', 'Jane Doe': 'Rhubarb & Custard' };
      expect(() => processQueryString(qs)).to.throw("Invalid postal codes: 'Blah Blah', 'Rhubarb & Custard'");
    });

    it('throws error when multiple postal codes are given for the same name', () => {
      // format that would be received from express
      const qs = { 'John Doe': ['Blah Blah', 'Rhubarb & Custard'] };
      expect(() => processQueryString(qs)).to.throw(
        "More than one postal code given for 'John Doe': 'Blah Blah', 'Rhubarb & Custard'",
      );
    });
  });
});
