import { Order } from '../types';

/**
 * Simulates triggering a WhatsApp Message API (e.g., Meta Cloud API, Twilio, WATI)
 * In a full-stack app, this would typically be triggered by a backend webhook 
 * listening to 'payment.captured'. Here we invoke it directly upon successful payment.
 */
export const sendWhatsAppOrderConfirmation = async (order: Order) => {
  try {
    const trackingUrl = `${window.location.origin}/?page=track-order&id=${order.orderNumber}`;
    
    // Construct the WhatsApp message payload
    const messagePayload = {
      messaging_product: "whatsapp",
      to: order.customerMobile, // Ensure it has country code, e.g., +91
      type: "template",
      template: {
        name: "order_confirmation_with_tracking",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: order.customerName },
              { type: "text", text: order.orderNumber },
              { type: "text", text: `₹${order.finalTotal.toLocaleString('en-IN')}` },
            ]
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [
              { type: "text", text: order.orderNumber } // dynamic url param if needed
            ]
          }
        ]
      }
    };

    const fallbackTextMessage = `🎉 *Order Confirmed!*\n\nHi ${order.customerName},\nYour payment of ₹${order.finalTotal.toLocaleString('en-IN')} is successful! We've received your order *${order.orderNumber}*.\n\n🚚 *Track your shipment live here:*\n${trackingUrl}\n\nThank you for shopping with Suit Aura Girls! ✨`;

    console.log('[WhatsApp API Webhook Triggered] Payload:', messagePayload);
    console.log('[WhatsApp API] Fallback Text Preview:\n' + fallbackTextMessage);

    // If API credentials exist, make the real fetch call
    const WHATSAPP_API_URL = import.meta.env.VITE_WHATSAPP_API_URL || '';
    const WHATSAPP_ACCESS_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || '';

    if (WHATSAPP_API_URL && WHATSAPP_ACCESS_TOKEN) {
      const response = await fetch(WHATSAPP_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload)
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status}`);
      }
      console.log('[WhatsApp API] Message dispatched successfully');
    } else {
      console.log('[WhatsApp API] Running in simulation mode (No API keys provided). Notification queued.');
    }
    
    return true;
  } catch (error) {
    console.error('[WhatsApp API] Failed to trigger notification:', error);
    return false;
  }
};
