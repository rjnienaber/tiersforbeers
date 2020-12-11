const debug = require('debug')('tiersforbeers:server');
const express = require('express');
const asyncHandler = require('express-async-handler');
const config = require('./config');
const { LocationsProcessor } = require('./locations_processor');

const app = express();

app.get(
  '/rss.xml',
  asyncHandler(async (request, response) => {
    const locationsProcessor = new LocationsProcessor(config, request.query);

    const result = await locationsProcessor.getFeedFileTime();
    debug(`Retrieved feed file time: '${result}'`);
    if (result === 'current') {
      debug(`Serving existing file from ${locationsProcessor.feedFilePath}`);
      response.sendFile(locationsProcessor.feedFilePath);
      return;
    }

    const changedLocations = await locationsProcessor.getChangedLocations();
    debug(`Number of changed locations: ${changedLocations.length}`);

    // TODO: handle absent file
    if (!changedLocations.length) {
      debug('Updating feed file time to now');
      await locationsProcessor.updateFeedFileTime();

      debug(`Serving existing file from ${locationsProcessor.feedFilePath}`);
      response.sendFile(locationsProcessor.feedFilePath);
      return;
    }

    debug('Changed locations detected. Creating new feed file.');
    await locationsProcessor.createFeedFile(changedLocations);

    debug(`Serving existing file from ${locationsProcessor.feedFilePath}`);
    response.sendFile(locationsProcessor.feedFilePath);
  }),
);

const listener = app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Your app is listening on port ${listener.address().port}`);
});
