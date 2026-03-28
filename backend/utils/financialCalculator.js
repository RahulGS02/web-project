/**
 * Financial Calculator Utility
 * Handles GST, platform fee, and total amount calculations
 */

const GST_RATE = parseFloat(process.env.GST_RATE) || 0.12; // 12% GST
const PLATFORM_FEE_RATE = parseFloat(process.env.PLATFORM_FEE_RATE) || 0.01; // 1% platform fee

/**
 * Calculate order financial breakdown
 * @param {Array} items - Array of order items with price and quantity
 * @returns {Object} Financial breakdown
 */
const calculateOrderFinancials = (items) => {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // Calculate GST amount
  const gstAmount = subtotal * GST_RATE;

  // Calculate platform fee
  const platformFee = subtotal * PLATFORM_FEE_RATE;

  // Calculate total amount
  const totalAmount = subtotal + gstAmount + platformFee;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    gstRate: GST_RATE,
    platformFee: parseFloat(platformFee.toFixed(2)),
    platformFeeRate: PLATFORM_FEE_RATE,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    currency: 'INR'
  };
};

/**
 * Calculate amount in paise (Razorpay requires amount in smallest currency unit)
 * @param {Number} amount - Amount in rupees
 * @returns {Number} Amount in paise
 */
const convertToPaise = (amount) => {
  return Math.round(amount * 100);
};

/**
 * Convert paise to rupees
 * @param {Number} paise - Amount in paise
 * @returns {Number} Amount in rupees
 */
const convertToRupees = (paise) => {
  return parseFloat((paise / 100).toFixed(2));
};

/**
 * Validate payment amount
 * @param {Number} expectedAmount - Expected amount
 * @param {Number} receivedAmount - Received amount
 * @returns {Boolean} Whether amounts match
 */
const validatePaymentAmount = (expectedAmount, receivedAmount) => {
  const expectedPaise = convertToPaise(expectedAmount);
  const receivedPaise = typeof receivedAmount === 'number' ? receivedAmount : parseInt(receivedAmount);
  return expectedPaise === receivedPaise;
};

/**
 * Format currency for display
 * @param {Number} amount - Amount to format
 * @returns {String} Formatted currency string
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Calculate gateway fee estimate
 * @param {Number} amount - Transaction amount
 * @param {String} paymentMethod - Payment method (upi, card, netbanking)
 * @returns {Number} Estimated gateway fee
 */
const estimateGatewayFee = (amount, paymentMethod = 'upi') => {
  const feeRates = {
    upi: 0.01,      // 1% for UPI
    card: 0.02,     // 2% for cards
    netbanking: 0.015 // 1.5% for net banking
  };

  const rate = feeRates[paymentMethod] || feeRates.upi;
  return parseFloat((amount * rate).toFixed(2));
};

module.exports = {
  calculateOrderFinancials,
  convertToPaise,
  convertToRupees,
  validatePaymentAmount,
  formatCurrency,
  estimateGatewayFee,
  GST_RATE,
  PLATFORM_FEE_RATE
};

