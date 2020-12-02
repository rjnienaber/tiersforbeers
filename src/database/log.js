const Sequelize = require('sequelize');

function defineLog(sequelize, locationsModel) {
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

  return model;
}

module.exports = {
  defineLog,
};
