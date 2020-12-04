const Sequelize = require('sequelize');

function defineLocation(sequelize) {
  const model = sequelize.define('location', {
    name: {
      type: Sequelize.STRING,
    },
    postalCode: {
      type: Sequelize.STRING(20),
      unique: true,
    },
    council: {
      type: Sequelize.STRING,
    },
    tier: {
      type: Sequelize.STRING(20),
    },
  });

  const updateOnDuplicate = Object.values(model.rawAttributes)
    // _autoGenerated is created by sequelize
    // eslint-disable-next-line no-underscore-dangle
    .filter((r) => !r._autoGenerated && !r.unique)
    .map((r) => r.field);

  model.updateLocations = async (values) => {
    const records = Object.fromEntries(values.map((v) => [v.postalCode, v]));
    const locations = await model.findAll({ where: { postalCode: Object.keys(records) } });

    locations.forEach((l) => {
      const updatedValues = records[l.postalCode];
      delete records[l.postalCode];
      Object.assign(l, updatedValues);
    });

    const changedPostalCodes = new Set([
      ...locations.filter((l) => l.changed()).map((l) => l.postalCode), // changed
      ...Object.keys(records), // new
    ]);

    const savedLocations = await model.bulkCreate(values, { updateOnDuplicate });
    return savedLocations.filter(({ postalCode }) => changedPostalCodes.has(postalCode));
  };
  return model;
}

module.exports = {
  defineLocation,
};
