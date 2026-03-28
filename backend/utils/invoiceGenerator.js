/**
 * Invoice Generator
 * Generates Excel invoices with GST and financial details
 */

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { formatCurrency } = require('./financialCalculator');

const INVOICE_DIR = process.env.INVOICE_PATH || './generated_invoices';

// Ensure invoice directory exists
if (!fs.existsSync(INVOICE_DIR)) {
  fs.mkdirSync(INVOICE_DIR, { recursive: true });
}

/**
 * Generate invoice for an order
 * @param {Object} order - Order details
 * @param {Array} orderItems - Order items
 * @param {Object} user - User details
 * @param {Object} financials - Financial breakdown
 * @returns {String} Path to generated invoice
 */
const generateInvoice = async (order, orderItems, user, financials) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice');

    // Set column widths
    worksheet.columns = [
      { width: 5 },
      { width: 30 },
      { width: 15 },
      { width: 12 },
      { width: 15 },
      { width: 18 }
    ];

    // Company Header
    worksheet.mergeCells('A1:F1');
    const titleRow = worksheet.getCell('A1');
    titleRow.value = 'RAJINI PHARMA GENERIC COMMON AND SURGICALS';
    titleRow.font = { size: 16, bold: true, color: { argb: 'FF1976D2' } };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE3F2FD' }
    };

    // Address
    worksheet.mergeCells('A2:F2');
    const addressRow = worksheet.getCell('A2');
    addressRow.value = 'No. 153/1A1A1, Ground Floor & First Floor, Periyasavalai Main Road, Anna Nagar';
    addressRow.font = { size: 10 };
    addressRow.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A3:F3');
    const addressRow2 = worksheet.getCell('A3');
    addressRow2.value = 'Thirukoilur Town, Thirukoilur Taluk, Kallakurichi District - 605757';
    addressRow2.font = { size: 10 };
    addressRow2.alignment = { horizontal: 'center' };

    // Invoice Title
    worksheet.mergeCells('A5:F5');
    const invoiceTitle = worksheet.getCell('A5');
    invoiceTitle.value = 'MEDICAL SALES INVOICE';
    invoiceTitle.font = { size: 14, bold: true };
    invoiceTitle.alignment = { horizontal: 'center' };
    invoiceTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF5F5F5' }
    };

    // Invoice Details
    worksheet.getCell('A7').value = 'Invoice No:';
    worksheet.getCell('B7').value = order.order_id;
    worksheet.getCell('D7').value = 'Date:';
    worksheet.getCell('E7').value = new Date(order.created_at).toLocaleDateString('en-IN');

    worksheet.getCell('A8').value = 'Order ID:';
    worksheet.getCell('B8').value = order.order_id;
    worksheet.getCell('D8').value = 'Payment ID:';
    worksheet.getCell('E8').value = order.razorpay_payment_id || 'N/A';

    // Customer Details
    worksheet.getCell('A10').value = 'Bill To:';
    worksheet.getCell('A10').font = { bold: true };
    worksheet.getCell('A11').value = user.name;
    worksheet.getCell('A12').value = user.email;
    worksheet.getCell('A13').value = user.phone || 'N/A';

    // Shipping Address
    worksheet.getCell('D10').value = 'Ship To:';
    worksheet.getCell('D10').font = { bold: true };
    worksheet.mergeCells('D11:F13');
    const shippingCell = worksheet.getCell('D11');
    shippingCell.value = order.shipping_address || 'N/A';
    shippingCell.alignment = { wrapText: true, vertical: 'top' };

    // Table Header
    const headerRow = worksheet.getRow(15);
    headerRow.values = ['#', 'Medicine Name', 'Batch/Category', 'Quantity', 'Unit Price', 'Total Price'];
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1976D2' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Add items
    let currentRow = 16;
    orderItems.forEach((item, index) => {
      const row = worksheet.getRow(currentRow);
      row.values = [
        index + 1,
        item.medicine_name,
        item.category || 'General',
        item.quantity,
        formatCurrency(item.price),
        formatCurrency(item.subtotal)
      ];
      row.alignment = { vertical: 'middle' };
      currentRow++;
    });

    // Summary section
    currentRow += 1;
    worksheet.getCell(`D${currentRow}`).value = 'Subtotal:';
    worksheet.getCell(`D${currentRow}`).font = { bold: true };
    worksheet.getCell(`F${currentRow}`).value = formatCurrency(financials.subtotal);

    currentRow++;
    worksheet.getCell(`D${currentRow}`).value = `GST (${financials.gstRate * 100}%):`;
    worksheet.getCell(`D${currentRow}`).font = { bold: true };
    worksheet.getCell(`F${currentRow}`).value = formatCurrency(financials.gstAmount);

    currentRow++;
    worksheet.getCell(`D${currentRow}`).value = 'Platform Fee:';
    worksheet.getCell(`D${currentRow}`).font = { bold: true };
    worksheet.getCell(`F${currentRow}`).value = formatCurrency(financials.platformFee);

    currentRow++;
    worksheet.getCell(`D${currentRow}`).value = 'Total Amount Paid:';
    worksheet.getCell(`D${currentRow}`).font = { bold: true, size: 12 };
    worksheet.getCell(`F${currentRow}`).value = formatCurrency(financials.totalAmount);
    worksheet.getCell(`F${currentRow}`).font = { bold: true, size: 12, color: { argb: 'FF1976D2' } };

    // Payment details
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'Payment Method:';
    worksheet.getCell(`B${currentRow}`).value = order.payment_method || 'Online Payment';

    currentRow++;
    worksheet.getCell(`A${currentRow}`).value = 'Payment Status:';
    worksheet.getCell(`B${currentRow}`).value = order.payment_status === 'paid' ? 'PAID' : 'PENDING';
    worksheet.getCell(`B${currentRow}`).font = {
      bold: true,
      color: { argb: order.payment_status === 'paid' ? 'FF4CAF50' : 'FFFF9800' }
    };

    currentRow++;
    worksheet.getCell(`A${currentRow}`).value = 'Payment Date:';
    worksheet.getCell(`B${currentRow}`).value = order.paid_at ?
      new Date(order.paid_at).toLocaleString('en-IN') : 'N/A';

    // Footer
    currentRow += 3;
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const footerCell = worksheet.getCell(`A${currentRow}`);
    footerCell.value = 'Thank you for your business!';
    footerCell.font = { italic: true, size: 10 };
    footerCell.alignment = { horizontal: 'center' };

    currentRow++;
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const disclaimerCell = worksheet.getCell(`A${currentRow}`);
    disclaimerCell.value = 'This is a computer-generated invoice and does not require a signature.';
    disclaimerCell.font = { size: 8, color: { argb: 'FF757575' } };
    disclaimerCell.alignment = { horizontal: 'center' };

    // Add borders to item table
    for (let i = 15; i < currentRow - 5; i++) {
      for (let j = 1; j <= 6; j++) {
        const cell = worksheet.getCell(i, j);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }

    // Save file
    const fileName = `invoice_${order.order_id}.xlsx`;
    const filePath = path.join(INVOICE_DIR, fileName);

    await workbook.xlsx.writeFile(filePath);

    return {
      fileName,
      filePath
    };

  } catch (error) {
    console.error('Invoice generation error:', error);
    throw new Error('Failed to generate invoice');
  }
};

/**
 * Get invoice file path
 * @param {String} orderId - Order ID
 * @returns {String} File path
 */
const getInvoicePath = (orderId) => {
  const fileName = `invoice_${orderId}.xlsx`;
  return path.join(INVOICE_DIR, fileName);
};

/**
 * Check if invoice exists
 * @param {String} orderId - Order ID
 * @returns {Boolean} Whether invoice exists
 */
const invoiceExists = (orderId) => {
  const filePath = getInvoicePath(orderId);
  return fs.existsSync(filePath);
};

module.exports = {
  generateInvoice,
  getInvoicePath,
  invoiceExists,
  INVOICE_DIR
};

