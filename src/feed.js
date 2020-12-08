const path = require('path');
const { Feed } = require('feed');
const { promises: fs } = require('fs');

function generateFeedFilePath(dataDir, locations) {
  const postalCodes = locations.map((l) => l.postalCode.toLowerCase());
  postalCodes.sort();
  return path.join(dataDir, `feed_${postalCodes.join('_')}.xml`);
}

async function getFeedFileTime(feedFilePath) {
  let stat;
  try {
    stat = await fs.stat(feedFilePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }

    return 'absent';
  }

  const fileDate = new Date(stat.mtime.toISOString().slice(0, 10));
  const currentDate = new Date(new Date().toISOString().slice(0, 10));

  if (fileDate.getTime() === currentDate.getTime()) {
    return 'current';
  } else if (fileDate < currentDate) {
    return 'outdated';
  }

  return 'absent';
}

async function updateFeedFileTime(feedFilePath) {
  const now = new Date();
  await fs.utimes(feedFilePath, now, now);
}

function generateFeedFile(feedFilePath, logs, config) {
  const now = new Date();
  const postalCodes = logs.map((l) => l.location.postalCode);
  const link = `${config.appUrl}/rss.xml`;

  const feed = new Feed({
    title: 'Tier Changelog',
    description: `The list of covid-19 tier changes for the following postal codes: ${postalCodes.join(', ')}`,
    link,
    lastBuildDate: now,
    generator: 'https://github.com/rjnienaber/tiersforbeers',
    copyright: 'Copyright (C) 2020 Richard Nienaber',
    feedLinks: {
      rss: link,
    },
  });

  logs.forEach((log) => {
    const {
      id,
      createdAt,
      location: { name, postalCode, tier, council },
    } = log;
    const title = `Change detected for area '${name}' (${postalCode}): ${tier}`;
    const description =
      `A tier change has been detected for area '${name}' (${postalCode}), ` +
      `in the council '${council}'. The new tier is '${tier}'`;

    feed.addItem({
      title,
      link: config.govUk.url,
      id: `${config.appUrl}/${id}`,
      date: createdAt,
      description,
    });
  });

  return feed.rss2();
}

module.exports = {
  generateFeedFile,
  generateFeedFilePath,
  getFeedFileTime,
  updateFeedFileTime,
};
