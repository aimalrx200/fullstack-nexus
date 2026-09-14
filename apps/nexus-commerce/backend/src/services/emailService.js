import nodemailer from "nodemailer";
import env from "#config/env.js";
import { logger } from "#config/logger.js";
import { formatMoney } from "#utils/currencyConverter.js";

let transporter = null;

export const initEmailService = async () => {
  if (env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    logger.info({
      msg: "📧 Virtual Ethereal SMTP transporter initialized for commerce sandbox",
    });
  }
};

export const sendOrderReceiptEmail = async (order) => {
  if (!transporter) await initEmailService();

  const formattedTotal = formatMoney(
    order.pricing.total,
    order.pricing.currency,
  );

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
          <strong>${item.title}</strong><br />
          <span style="font-size: 11px; color: #64748b;">SKU: ${item.sku} × ${item.quantity}</span>
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
          ${formatMoney(item.totalUSD || item.unitPriceUSD, order.pricing.currency)}
        </td>
      </tr>
    `,
    )
    .join("");

  const mailOptions = {
    from: `"Nexus Commerce" <no-reply@nexuscommerce.io>`,
    to: order.customerEmail,
    subject: `Order Confirmed: #${order.orderNumber}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #0f172a; margin: 0;">Order #${order.orderNumber} Confirmed</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Thank you for your purchase with Nexus Commerce.</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="text-align: left; color: #94a3b8; font-size: 11px; text-transform: uppercase;">
              <th style="padding-bottom: 8px;">Item</th>
              <th style="padding-bottom: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #e2e8f0; text-align: right;">
          <p style="margin: 0; font-size: 14px; font-weight: bold; color: #0f172a;">Total: ${formattedTotal}</p>
        </div>
        <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; font-size: 12px; color: #475569;">
          <strong>Shipping to:</strong><br />
          ${order.shippingAddress.recipientName}<br />
          ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.country}<br />
          Phone: ${order.shippingAddress.phone}
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  if (env.NODE_ENV === "development") {
    logger.info({
      msg: "Order receipt email dispatched",
      previewUrl: nodemailer.getTestMessageUrl(info),
    });
  }
};

export const sendSupportTicketEmail = async (ticket) => {
  if (!transporter) await initEmailService();

  const mailOptions = {
    from: `"Nexus Support" <support@nexuscommerce.io>`,
    to: ticket.email,
    subject: `Support Ticket Received: #${ticket.ticketNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h3>Ticket #${ticket.ticketNumber} Logged</h3>
        <p>Hi ${ticket.name},</p>
        <p>We received your inquiry regarding <strong>${ticket.subject}</strong>. A support specialist is reviewing your request and will follow up shortly.</p>
        <div style="padding: 12px; background: #f8fafc; border-radius: 6px; font-size: 12px; color: #475569;">
          "${ticket.message}"
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
