const debug = require('debug')('tiersforbeers:server');
const express = require('express');
const asyncHandler = require('express-async-handler');
const config = require('./config');
const { LocationsProcessor } = require('./locations_processor');

const app = express();

function sendFeedFile(locationsProcessor, response) {
  debug(`Serving rss file from ${locationsProcessor.feedFilePath}`);
  response.sendFile(locationsProcessor.feedFilePath);
}

app.get(
  '/rss.xml',
  asyncHandler(async (request, response) => {
    const locationsProcessor = new LocationsProcessor(config, request.query);
    try {
      const result = await locationsProcessor.getFeedFileTime();
      debug(`Retrieved feed file time: '${result}'`);
      if (result === 'current') {
        sendFeedFile(locationsProcessor, response);
        return;
      }

      const changedLocations = await locationsProcessor.getChangedLocations();
      debug(`Number of changed locations: ${changedLocations.length}`);

      if (changedLocations.length) {
        debug('Changed locations detected. Creating new feed file.');
        await locationsProcessor.createFeedFile(changedLocations);
      } else if (result !== 'absent') {
        debug('Updating feed file time to now');
        await locationsProcessor.updateFeedFileTime();

        sendFeedFile(locationsProcessor, response);
        return;
      }

      sendFeedFile(locationsProcessor, response);
    } finally {
      await locationsProcessor.close();
    }
  }),
);

const listener = app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Your app is listening on port ${listener.address().port}`);
});
