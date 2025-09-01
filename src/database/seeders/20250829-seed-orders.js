module.exports = {
  up: async (queryInterface, DataTypes) => {
    const now = new Date();

    // Insert orders si no existen
    const existingOrders = await queryInterface.sequelize.query(
      `SELECT id FROM orders WHERE "clientName" IN ('Ana López', 'Carlos Pérez');`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (existingOrders.length === 0) {
      await queryInterface.bulkInsert('orders', [
        { clientName: 'Ana López', status: 'initiated', total: 0, createdAt: now, updatedAt: now },
        { clientName: 'Carlos Pérez', status: 'sent', total: 0, createdAt: now, updatedAt: now },
      ], {});
    }

    // Obtener ids de las órdenes
    const orders = await queryInterface.sequelize.query(
      `SELECT id, "clientName" FROM orders WHERE "clientName" IN ('Ana López', 'Carlos Pérez');`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const orderMap = {};
    orders.forEach(order => { orderMap[order.clientName] = order.id; });

    // Revisar si ya existen items
    const existingItems = await queryInterface.sequelize.query(
      `SELECT description FROM order_items WHERE description IN ('Ceviche', 'Chicha morada', 'Lomo saltado');`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (existingItems.length === 0) {
      await queryInterface.bulkInsert('order_items', [
        // Items para Ana
        { description: 'Ceviche', quantity: 2, unitPrice: 50, orderId: orderMap['Ana López'], createdAt: now, updatedAt: now },
        { description: 'Chicha morada', quantity: 1, unitPrice: 10, orderId: orderMap['Ana López'], createdAt: now, updatedAt: now },
        // Item para Carlos
        { description: 'Lomo saltado', quantity: 1, unitPrice: 40, orderId: orderMap['Carlos Pérez'], createdAt: now, updatedAt: now },
      ], {});
    }

    // Recalcular y actualizar el total de cada orden
    for (const clientName of ['Ana López', 'Carlos Pérez']) {
      const orderId = orderMap[clientName];
      const items = await queryInterface.sequelize.query(
        `SELECT quantity, "unitPrice" FROM order_items WHERE "orderId" = :orderId;`,
        { 
          replacements: { orderId },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );

      const total = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

      await queryInterface.bulkUpdate('orders', 
        { total, updatedAt: now }, 
        { id: orderId }
      );
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('order_items', {
      description: ['Ceviche', 'Chicha morada', 'Lomo saltado']
    });
    await queryInterface.bulkDelete('orders', {
      clientName: ['Ana López', 'Carlos Pérez']
    });
  },
};
