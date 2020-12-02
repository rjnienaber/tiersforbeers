const axios = require('axios');
const cheerio = require('cheerio');
const debug = require('debug')('apis');

const GOV_UK_CHECKER_URL = 'https://www.gov.uk/find-coronavirus-local-restrictions'

function parseHtmlForMessage(html) {
  try {
    const $ = cheerio.load(html);
    const element = $('#content > div > div > div > p:nth-child(5)');
    return element[0].children[0].data.trim();
  } catch (err) {
    debug('Failed to find message in postal code');
    return '';
  }
}

async function checkPostalCode(postalCode) {
  const response = await axios.post(GOV_UK_CHECKER_URL, { 'postcode-lookup': postalCode});

  const text = parseHtmlForMessage(response.data);
  const matches = /(.*) will be in (.*)\./.exec(text);
  if (matches) {
    const [, council, tier] = matches;
    return {council, tier};
  }
  return undefined;
}
module.exports.checkPostalCode = checkPostalCode;
