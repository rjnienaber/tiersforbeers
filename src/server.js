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
      if (result === 'current') {
        sendFeedFile(locationsProcessor, response);
        return;
      }

      const changedLocations = await locationsProcessor.checkChangedLocations();

      if (!changedLocations && result !== 'absent') {
        await locationsProcessor.updateFeedFileTime();

        sendFeedFile(locationsProcessor, response);
        return;
      }

      await locationsProcessor.createFeedFile();
      sendFeedFile(locationsProcessor, response);
    } finally {
      await locationsProcessor.close();
    }
  }),
);

app.get('/', (request, response) => {
  response.setHeader('content-type', 'text/plain');
  response.sendFile(config.readmeFilePath);
});

const listener = app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Your app is listening on port ${listener.address().port}`);
});
