// migrations/20250830-create-orders.js
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('orders', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      clientName: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.ENUM('initiated','sent','delivered'), allowNull: false, defaultValue: 'initiated' },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
  },
  down: async queryInterface => { await queryInterface.dropTable('orders'); },
};
