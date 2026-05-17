import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      secure: this.configService.get<boolean>('email.secure'),
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.pass'),
      },
    });
  }

  private get from(): string {
    const name = this.configService.get<string>('email.fromName') || 'Heart of the Cards';
    const addr = this.configService.get<string>('email.fromAddress') || 'noreply@heartofthecards.com.au';
    return `"${name}" <${addr}>`;
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }

  async sendOrderConfirmation(params: {
    to: string;
    firstName: string;
    orderNumber: string;
    items: { productName: string; quantity: number; unitPrice: string }[];
    subtotal: string;
    shippingCost: string;
    total: string;
    deliveryAddress: { fullName: string; line1: string; suburb: string; state: string; postcode: string };
  }): Promise<void> {
    const itemRows = params.items
      .map(
        (i) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#d1d5db;">${i.productName}</td>
          <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#d1d5db;text-align:center;">×${i.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#ffffff;text-align:right;">A$${(Number(i.unitPrice) * i.quantity).toFixed(2)}</td>
        </tr>`,
      )
      .join('');

    const html = `
      ${emailBase(`
        <h2 style="color:#f59e0b;font-size:22px;margin:0 0 8px;">Order Confirmed! 🃏</h2>
        <p style="color:#9ca3af;margin:0 0 24px;">Hi ${params.firstName}, your order has been placed and payment received.</p>

        <div style="background:#1a1a2e;border-radius:8px;padding:16px;margin-bottom:24px;">
          <p style="color:#6b7280;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
          <p style="color:#f59e0b;font-size:20px;font-weight:bold;margin:0;font-family:monospace;">${params.orderNumber}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          ${itemRows}
        </table>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr>
            <td style="color:#6b7280;padding:4px 0;">Subtotal</td>
            <td style="color:#ffffff;text-align:right;padding:4px 0;">A$${params.subtotal}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;padding:4px 0;">Shipping</td>
            <td style="color:${Number(params.shippingCost) === 0 ? '#10b981' : '#ffffff'};text-align:right;padding:4px 0;">${Number(params.shippingCost) === 0 ? 'FREE' : `A$${params.shippingCost}`}</td>
          </tr>
          <tr style="border-top:1px solid #2a2a2a;">
            <td style="color:#ffffff;font-weight:bold;padding:8px 0 4px;">Total</td>
            <td style="color:#f59e0b;font-weight:bold;text-align:right;font-size:18px;padding:8px 0 4px;">A$${params.total}</td>
          </tr>
        </table>

        <div style="background:#1a1a2e;border-radius:8px;padding:16px;">
          <p style="color:#6b7280;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Delivering to</p>
          <p style="color:#ffffff;margin:0;">${params.deliveryAddress.fullName}</p>
          <p style="color:#9ca3af;margin:4px 0 0;">${params.deliveryAddress.line1}, ${params.deliveryAddress.suburb} ${params.deliveryAddress.state} ${params.deliveryAddress.postcode}</p>
        </div>
      `)}`;

    await this.send(params.to, `Order Confirmed — ${params.orderNumber}`, html);
  }

  async sendOrderStatusUpdate(params: {
    to: string;
    firstName: string;
    orderNumber: string;
    status: string;
  }): Promise<void> {
    const statusMessages: Record<string, { label: string; message: string; color: string }> = {
      PROCESSING: { label: 'Processing', message: "We're preparing your order for dispatch.", color: '#3b82f6' },
      SHIPPED: { label: 'Shipped', message: "Great news — your order is on its way!", color: '#f59e0b' },
      DELIVERED: { label: 'Delivered', message: 'Your order has been delivered. Enjoy your cards!', color: '#10b981' },
      CANCELLED: { label: 'Cancelled', message: 'Your order has been cancelled. Contact us if you have questions.', color: '#ef4444' },
      REFUNDED: { label: 'Refunded', message: 'Your refund has been processed. Allow 3–5 business days.', color: '#8b5cf6' },
    };

    const info = statusMessages[params.status] || { label: params.status, message: 'Your order status has been updated.', color: '#6b7280' };

    const html = `
      ${emailBase(`
        <h2 style="color:${info.color};font-size:22px;margin:0 0 8px;">Order ${info.label}</h2>
        <p style="color:#9ca3af;margin:0 0 24px;">Hi ${params.firstName}, ${info.message}</p>
        <div style="background:#1a1a2e;border-radius:8px;padding:16px;">
          <p style="color:#6b7280;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
          <p style="color:#f59e0b;font-size:20px;font-weight:bold;margin:0;font-family:monospace;">${params.orderNumber}</p>
        </div>
      `)}`;

    await this.send(params.to, `Order Update — ${params.orderNumber} is ${info.label}`, html);
  }

  async sendPasswordReset(params: {
    to: string;
    firstName: string;
    resetUrl: string;
  }): Promise<void> {
    const html = `
      ${emailBase(`
        <h2 style="color:#f59e0b;font-size:22px;margin:0 0 8px;">Reset Your Password</h2>
        <p style="color:#9ca3af;margin:0 0 24px;">Hi ${params.firstName}, we received a request to reset your password. Click the button below — this link expires in 1 hour.</p>
        <a href="${params.resetUrl}"
           style="display:inline-block;background:#f59e0b;color:#0a0a0a;font-weight:bold;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;margin-bottom:24px;">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:13px;margin:0;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
      `)}`;

    await this.send(params.to, 'Reset your Heart of the Cards password', html);
  }

  async sendWelcome(params: { to: string; firstName: string }): Promise<void> {
    const html = `
      ${emailBase(`
        <h2 style="color:#f59e0b;font-size:22px;margin:0 0 8px;">Welcome to Heart of the Cards! 🃏</h2>
        <p style="color:#9ca3af;margin:0 0 24px;">Hi ${params.firstName}, your account is ready. Browse our range of Pokémon and One Piece TCG products.</p>
        <a href="http://localhost:5173/products"
           style="display:inline-block;background:#f59e0b;color:#0a0a0a;font-weight:bold;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;">
          Start Shopping
        </a>
      `)}`;

    await this.send(params.to, 'Welcome to Heart of the Cards', html);
  }
}

function emailBase(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
            <!-- Header -->
            <tr>
              <td style="background:#111827;border-radius:12px 12px 0 0;padding:24px 32px;border-bottom:2px solid #f59e0b;">
                <table width="100%"><tr>
                  <td>
                    <span style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#0a0a0a;font-weight:900;font-size:20px;padding:6px 14px;border-radius:8px;letter-spacing:-0.5px;">H</span>
                    <span style="color:#ffffff;font-size:18px;font-weight:bold;margin-left:10px;vertical-align:middle;">Heart of the Cards</span>
                  </td>
                </tr></table>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="background:#111827;padding:32px;border-radius:0 0 12px 12px;">
                ${content}
                <hr style="border:none;border-top:1px solid #1f2937;margin:32px 0;">
                <p style="color:#374151;font-size:12px;margin:0;">© ${new Date().getFullYear()} Heart of the Cards · heartofthecards.com.au</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;
}
