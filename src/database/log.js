const Sequelize = require('sequelize');

function defineLog(sequelize, locationsModel, config) {
  const model = sequelize.define(
    'log',
    {
      tier: {
        type: Sequelize.STRING(20),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      timestamps: false,
    },
  );

  model.belongsTo(locationsModel, { foreignKey: { allowNull: false } });
  locationsModel.hasMany(model);

  model.updateLogs = async (locations) => {
    const logs = locations.map((l) => ({ tier: l.tier, locationId: l.id }));
    return await model.bulkCreate(logs);
  };

  model.latest = async (postalCodes) => {
    return model.findAll({
      limit: config.feed.size,
      order: [['id', 'DESC']],
      include: [
        {
          model: locationsModel,
          where: { postalCode: postalCodes },
        },
      ],
    });
  };

  return model;
}

module.exports = {
  defineLog,
};
