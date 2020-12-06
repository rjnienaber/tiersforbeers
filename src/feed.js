const path = require('path');
const {promises: fs} = require('fs');

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

module.exports = {
  generateFeedFilePath,
  getFeedFileTime,
  updateFeedFileTime
};
