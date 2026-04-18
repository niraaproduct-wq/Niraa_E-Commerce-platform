const generateInvoice = (order) => {
  return {
    orderId: order._id,
    date: new Date().toLocaleDateString(),
    items: order.items,
    total: order.total,
    customer: order.user.name || 'Customer'
  };
};

module.exports = generateInvoice;

