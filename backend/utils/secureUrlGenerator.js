const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Secure URL Generator for Invoice Downloads
 * Generates signed URLs with expiration
 */

class SecureUrlGenerator {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'rajini_pharma_secret';
    this.baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    this.defaultExpirationMinutes = parseInt(process.env.INVOICE_LINK_EXPIRATION_MINUTES) || 1440; // 24 hours
  }

  /**
   * Generate secure invoice download link
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID (for validation)
   * @param {number} expirationMinutes - Link expiration time
   * @returns {string} Secure download URL
   */
  generateInvoiceLink(orderId, userId, expirationMinutes = null) {
    const expiration = expirationMinutes || this.defaultExpirationMinutes;
    const expiresAt = Date.now() + (expiration * 60 * 1000);

    // Create JWT token with order and user info
    const token = jwt.sign(
      {
        orderId,
        userId,
        type: 'invoice_download',
        exp: Math.floor(expiresAt / 1000)
      },
      this.secret
    );

    // Generate secure URL
    const secureUrl = `${this.baseUrl}/api/invoice/secure-download/${orderId}?token=${token}`;
    
    return secureUrl;
  }

  /**
   * Verify secure token
   * @param {string} token - JWT token from URL
   * @returns {object} Decoded token data or null
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.secret);
      
      // Check if token is for invoice download
      if (decoded.type !== 'invoice_download') {
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return null;
    }
  }

  /**
   * Generate short-lived public link (for WhatsApp)
   * @param {string} orderId - Order ID
   * @returns {string} Public download URL
   */
  generatePublicInvoiceLink(orderId) {
    // For WhatsApp, we use a simpler public link that redirects to secure download
    return `${this.baseUrl}/invoice/${orderId}`;
  }

  /**
   * Generate hash for file integrity verification
   * @param {string} filePath - Path to file
   * @returns {string} SHA256 hash
   */
  generateFileHash(fileContent) {
    return crypto
      .createHash('sha256')
      .update(fileContent)
      .digest('hex');
  }

  /**
   * Create signed URL with HMAC
   * @param {string} path - URL path
   * @param {number} expiresIn - Expiration in seconds
   * @returns {string} Signed URL
   */
  createSignedUrl(path, expiresIn = 86400) {
    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    const stringToSign = `${path}:${expires}`;
    
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(stringToSign)
      .digest('hex');

    return `${this.baseUrl}${path}?expires=${expires}&signature=${signature}`;
  }

  /**
   * Verify signed URL
   * @param {string} path - URL path
   * @param {number} expires - Expiration timestamp
   * @param {string} signature - HMAC signature
   * @returns {boolean} Valid or not
   */
  verifySignedUrl(path, expires, signature) {
    // Check if expired
    if (Math.floor(Date.now() / 1000) > expires) {
      return false;
    }

    // Verify signature
    const stringToSign = `${path}:${expires}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(stringToSign)
      .digest('hex');

    return signature === expectedSignature;
  }
}

module.exports = new SecureUrlGenerator();

