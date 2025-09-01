// migrations/20250830-create-order-items.js
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('order_items', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      description: { type: DataTypes.STRING, allowNull: false },
      quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      unitPrice: { type: DataTypes.FLOAT, allowNull: false },
      orderId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'orders', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
  },
  down: async queryInterface => { await queryInterface.dropTable('order_items'); },
};
