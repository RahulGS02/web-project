const axios = require('axios');
const jwt = require('jsonwebtoken');

/**
 * WhatsApp Notification Service
 * Supports multiple providers: Meta Cloud API, Twilio, 360dialog
 */

class WhatsAppService {
  constructor() {
    this.provider = process.env.WHATSAPP_PROVIDER || 'meta'; // meta, twilio, 360dialog
    this.enabled = process.env.WHATSAPP_ENABLED === 'true';
    
    // Meta Cloud API Configuration
    this.metaConfig = {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
      apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
      baseUrl: `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v18.0'}`
    };

    // Twilio Configuration
    this.twilioConfig = {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER
    };

    // 360dialog Configuration
    this.dialog360Config = {
      apiKey: process.env.DIALOG360_API_KEY,
      partnerId: process.env.DIALOG360_PARTNER_ID
    };
  }

  /**
   * Send order confirmation message with invoice link
   */
  async sendOrderConfirmation(orderData) {
    if (!this.enabled) {
      console.log('WhatsApp notifications are disabled');
      return { success: false, message: 'WhatsApp disabled' };
    }

    try {
      const { customerName, customerPhone, orderId, amount, invoiceLink } = orderData;

      // Validate phone number
      const formattedPhone = this.formatPhoneNumber(customerPhone);
      if (!formattedPhone) {
        throw new Error('Invalid phone number format');
      }

      // Prepare message
      const message = this.prepareOrderConfirmationMessage({
        customerName,
        orderId,
        amount,
        invoiceLink
      });

      // Send via selected provider
      let result;
      switch (this.provider) {
        case 'meta':
          result = await this.sendViaMeta(formattedPhone, message);
          break;
        case 'twilio':
          result = await this.sendViaTwilio(formattedPhone, message);
          break;
        case '360dialog':
          result = await this.sendVia360Dialog(formattedPhone, message);
          break;
        default:
          throw new Error(`Unknown provider: ${this.provider}`);
      }

      return {
        success: true,
        messageId: result.messageId,
        provider: this.provider,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Send via Meta Cloud API (WhatsApp Business API)
   */
  async sendViaMeta(phone, message) {
    const url = `${this.metaConfig.baseUrl}/${this.metaConfig.phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: message
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${this.metaConfig.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      messageId: response.data.messages[0].id,
      status: 'sent'
    };
  }

  /**
   * Send via Twilio
   */
  async sendViaTwilio(phone, message) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioConfig.accountSid}/Messages.json`;
    
    const params = new URLSearchParams();
    params.append('From', `whatsapp:${this.twilioConfig.whatsappNumber}`);
    params.append('To', `whatsapp:${phone}`);
    params.append('Body', message);

    const response = await axios.post(url, params, {
      auth: {
        username: this.twilioConfig.accountSid,
        password: this.twilioConfig.authToken
      }
    });

    return {
      messageId: response.data.sid,
      status: response.data.status
    };
  }

  /**
   * Send via 360dialog
   */
  async sendVia360Dialog(phone, message) {
    const url = 'https://waba.360dialog.io/v1/messages';
    
    const payload = {
      to: phone,
      type: 'text',
      text: {
        body: message
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        'D360-API-KEY': this.dialog360Config.apiKey,
        'Content-Type': 'application/json'
      }
    });

    return {
      messageId: response.data.messages[0].id,
      status: 'sent'
    };
  }

  /**
   * Prepare order confirmation message
   */
  prepareOrderConfirmationMessage({ customerName, orderId, amount, invoiceLink }) {
    const template = `🏥 *RAJINI PHARMA*

Hello ${customerName},

✅ Your order has been confirmed!

📦 Order ID: ${orderId.slice(0, 8).toUpperCase()}
💰 Amount Paid: ₹${amount}

📄 Download your invoice here:
${invoiceLink}

Thank you for shopping with RAJINI PHARMA!

---
RAJINI PHARMA GENERIC COMMON AND SURGICALS
Thirukoilur, Kallakurichi - 605757`;

    return template;
  }

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phone) {
    if (!phone) return null;

    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, remove it (Indian format)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // If doesn't start with country code, add India code (91)
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }

    // Validate length (should be 12 for India: 91 + 10 digits)
    if (cleaned.length !== 12) {
      return null;
    }

    return cleaned;
  }

  /**
   * Test WhatsApp connection
   */
  async testConnection(testPhone) {
    const testMessage = 'This is a test message from RAJINI PHARMA. Your WhatsApp integration is working correctly!';
    const formattedPhone = this.formatPhoneNumber(testPhone);

    if (!formattedPhone) {
      throw new Error('Invalid test phone number');
    }

    try {
      let result;
      switch (this.provider) {
        case 'meta':
          result = await this.sendViaMeta(formattedPhone, testMessage);
          break;
        case 'twilio':
          result = await this.sendViaTwilio(formattedPhone, testMessage);
          break;
        case '360dialog':
          result = await this.sendVia360Dialog(formattedPhone, testMessage);
          break;
      }

      return {
        success: true,
        message: 'Test message sent successfully',
        messageId: result.messageId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new WhatsAppService();

