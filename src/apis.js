const axios = require('axios');
const cheerio = require('cheerio');
const debug = require('debug')('tiersforbeers:apis');
const semaphore = require('semaphore');

const lock = semaphore(2);

function parseHtmlForDetails(html) {
  try {
    const $ = cheerio.load(html);

    const tierElement = $('#content > div > div > div > div > h1 > span');
    const tierText = tierElement[0].children[0].data.trim();

    const councilElement = $('#content > div > div > div > p > strong:nth-child(2)');
    const council = councilElement[0].children[0].data.trim();

    return [tierText, council];
  } catch (err) {
    debug('Failed to find message in postal code');
    return [];
  }
}

async function checkPostalCode(postalCode, config) {
  debug(`Looking up postal code for ${postalCode}`);
  const response = await axios.post(config.govUk.url, { 'postcode-lookup': postalCode });

  const [tier, council] = parseHtmlForDetails(response.data);
  if (!tier || !council) {
    throw new Error(`Unable to retrieve tier for postal code '${postalCode}'`);
  }

  return { council, tier };
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
