const { isValid } = require('postcode');

function processQueryString(queryString) {
  const entries = Object.entries(queryString);

  entries.forEach(([name, postalCodes]) => {
    if (Array.isArray(postalCodes)) {
      throw new Error(`More than one postal code given for '${name}': '${postalCodes.join("', '")}'`);
    }
  });

  const locations = entries.map(([key, value]) => ({ name: key, postalCode: value }));

  const invalidPostalCodes = locations.map(({ postalCode }) => postalCode).filter((postalCode) => !isValid(postalCode));
  if (invalidPostalCodes.length) {
    const message = `Invalid postal code${invalidPostalCodes.length > 1 ? 's' : ''}:`;
    throw new Error(`${message} '${invalidPostalCodes.join("', '")}'`);
  }

  return locations;
}

module.exports = {
  processQueryString,
};
