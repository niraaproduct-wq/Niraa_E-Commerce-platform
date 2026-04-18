const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const storageDir = path.join(__dirname, '../storage');

// Create storage dir if not exists
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir);
}

const appendToExcel = async (filename, sheetName, columns, dataRow) => {
  const filePath = path.join(storageDir, filename);
  const workbook = new ExcelJS.Workbook();
  let worksheet;

  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
    worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) {
      worksheet = workbook.addWorksheet(sheetName);
      worksheet.columns = columns;
    }
  } else {
    worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = columns;
  }

  // Add the row
  worksheet.addRow(dataRow);
  await workbook.xlsx.writeFile(filePath);
};

// Expose predefined methods
const saveUserToExcel = async (user) => {
  const columns = [
    { header: 'ID', key: 'id', width: 25 },
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Street', key: 'street', width: 30 },
    { header: 'City', key: 'city', width: 15 },
    { header: 'Pincode', key: 'pincode', width: 10 },
    { header: 'Latitude', key: 'lat', width: 15 },
    { header: 'Longitude', key: 'lng', width: 15 },
    { header: 'Registered At', key: 'date', width: 25 },
  ];
  
  const data = {
    id: user._id?.toString() || 'unknown',
    name: user.name,
    phone: user.phone,
    street: user.address?.street || '',
    city: user.address?.city || '',
    pincode: user.address?.pincode || '',
    lat: user.address?.lat || '',
    lng: user.address?.lng || '',
    date: new Date().toLocaleString()
  };

  try {
    await appendToExcel('users.xlsx', 'Users', columns, data);
    console.log('✅ User saved to Excel successfully!');
  } catch (err) {
    console.error('❌ Error saving user to Excel:', err);
  }
};

const saveOrderToExcel = async (order) => {
  const columns = [
    { header: 'Order ID', key: 'id', width: 25 },
    { header: 'Customer', key: 'customerName', width: 20 },
    { header: 'Phone', key: 'customerPhone', width: 15 },
    { header: 'Total Amount', key: 'total', width: 15 },
    { header: 'Payment Method', key: 'paymentMethod', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Items (Qty)', key: 'items', width: 40 },
    { header: 'Street', key: 'street', width: 30 },
    { header: 'City', key: 'city', width: 15 },
    { header: 'Pincode', key: 'pincode', width: 10 },
    { header: 'Date', key: 'date', width: 25 }
  ];

  const itemsString = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');

  const data = {
    id: order._id?.toString(),
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    total: order.total,
    paymentMethod: order.paymentMethod,
    status: order.status,
    items: itemsString,
    street: order.address?.street || '',
    city: order.address?.city || '',
    pincode: order.address?.pincode || '',
    date: new Date().toLocaleString()
  };

  try {
    await appendToExcel('orders.xlsx', 'Orders', columns, data);
    console.log('✅ Order saved to Excel successfully!');
  } catch (err) {
    console.error('❌ Error saving order to Excel:', err);
  }
};

module.exports = { saveUserToExcel, saveOrderToExcel };
