const axios = require('axios');
const cheerio = require('cheerio');
const debug = require('debug')('tiersforbeers:apis');
const semaphore = require('semaphore');

const lock = semaphore(2);

function parseHtmlForDetails(html) {
  try {
    const $ = cheerio.load(html);

    const getElement = (selector) => {
      const element = $(selector);
      if (element && element.length && element[0].children.length && element[0].children[0].data) {
        return element[0].children[0].data.trim();
      }
    }

    let tier = getElement('#content > div > div > div > h2:nth-child(3) > span');
    if (!tier) {
      tier = getElement('#content > div > div > div > div > h1 > span')
    }

    const council = getElement('#content > div > div > div > p:nth-child(2) > strong:nth-child(2)');

    return [tier, council];
  } catch (err) {
    debug('Failed to find message in postal code');
    return [];
  }
}

async function checkPostalCode(postalCode, config) {
  debug(`Looking up postal code for ${postalCode}`);
  const response = await axios.get(`${config.govUk.url}?postcode=${postalCode}`);

  const [tier, council] = parseHtmlForDetails(response.data);
  if (!tier || !council) {
    throw new Error(`Unable to retrieve tier for postal code '${postalCode}'`);
  }

  return { tier, council };
}

async function checkPostalCodes(postalCodes, config) {
  const govUkDetails = {};
  await Promise.all(
    postalCodes.map((ps) => {
      return new Promise((resolve, reject) => {
        lock.take(async () => {
          try {
            govUkDetails[ps] = await checkPostalCode(ps, config);
            resolve();
          } catch (err) {
            reject(err);
          } finally {
            lock.leave();
          }
        });
      });
    }),
  );
  return govUkDetails;
}

module.exports = {
  checkPostalCodes,
  checkPostalCode,
};
