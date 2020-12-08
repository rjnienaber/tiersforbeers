const axios = require('axios');
const cheerio = require('cheerio');
const debug = require('debug')('apis');

function parseHtmlForDetails(html) {
  try {
    const $ = cheerio.load(html);

    const tierElement = $('#content > div > div > div > div > h1');
    const tierText = tierElement[0].children[0].data.trim();

    const councilElement = $('#content > div > div > div > p:nth-child(2) > strong:nth-child(2)');
    const council = councilElement[0].children[0].data.trim();
    return [tierText, council];
  } catch (err) {
    debug('Failed to find message in postal code');
    return [];
  }
}

async function checkPostalCode(postalCode, config) {
  const response = await axios.post(config.govUk.url, { 'postcode-lookup': postalCode });

  const [tierText, council] = parseHtmlForDetails(response.data);
  if (!tierText || !council) {
    throw new Error(`Unable to retrieve tier for postal code '${postalCode}'`);
  }

  const matches = /This area is in (.*)/.exec(tierText);
  if (matches) {
    const [, tier] = matches;
    return { council, tier };
  }
  return undefined;
}
module.exports.checkPostalCode = checkPostalCode;
