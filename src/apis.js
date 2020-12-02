const axios = require('axios');
const cheerio = require('cheerio');
const debug = require('debug')('apis');

const GOV_UK_CHECKER_URL = 'https://www.gov.uk/find-coronavirus-local-restrictions';

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

async function checkPostalCode(postalCode) {
  const response = await axios.post(GOV_UK_CHECKER_URL, { 'postcode-lookup': postalCode });

  const [tierText, council] = parseHtmlForDetails(response.data);
  if (!tierText || !council) {
    return undefined;
  }

  const matches = /This area is in (.*)/.exec(tierText);
  if (matches) {
    const [, tier] = matches;
    return { council, tier };
  }
  return undefined;
}
module.exports.checkPostalCode = checkPostalCode;
