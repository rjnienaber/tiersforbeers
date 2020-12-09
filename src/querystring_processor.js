const { isValid } = require('postcode');

function processQueryString(queryString) {
  const entries = Object.entries(queryString);
  if (!entries.length) {
    throw new Error('No locations provided');
  }

  const [locations, invalidPostalCodes] = Object.entries(queryString).reduce(
    (acc, [name, value]) => {
      if (Array.isArray(value)) {
        throw new Error(`More than one postal code given for '${name}': '${value.join("', '")}'`);
      }

      const normalizedValue = value.replace(/\s+/g, '').toUpperCase();
      if (isValid(normalizedValue)) {
        acc[0].push({ name, postalCode: normalizedValue });
      } else {
        acc[1].push(value);
      }
      return acc;
    },
    [[], []],
  );

  if (invalidPostalCodes.length) {
    const message = `Invalid postal code${invalidPostalCodes.length > 1 ? 's' : ''}:`;
    throw new Error(`${message} '${invalidPostalCodes.join("', '")}'`);
  }

  return locations;
}

module.exports = {
  processQueryString,
};
