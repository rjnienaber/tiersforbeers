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

  const latestOptions = { limit: config.feed.size, order: [['id', 'DESC']] };
  model.latest = async () => model.findAll({ include: ['location'], ...latestOptions });

  model.removeOldItems = async () => {
    const latestIds = await model.findAll({ attributes: ['id'], raw: true, ...latestOptions });
    return model.destroy({ where: { id: { [Sequelize.Op.notIn]: latestIds.map((l) => l.id) } } });
  };

  return model;
}

module.exports = {
  defineLog,
};
