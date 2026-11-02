import nodemailer from 'nodemailer';
import { env } from '../config/env.mjs';
import { logger } from '../config/logger.mjs';

let transporter;

export const mailService = {
  async sendRegistrationConfirmation(registration, event) {
    if (!env.smtpUrl) {
      logger.info('Registration email skipped because SMTP_URL is not configured');
      return;
    }
    transporter ??= nodemailer.createTransport(env.smtpUrl, {
      connectionTimeout: env.mailTimeoutMs,
      greetingTimeout: env.mailTimeoutMs,
      socketTimeout: env.mailTimeoutMs
    });
    await transporter.sendMail({
      from: env.mailFrom,
      to: registration.email,
      subject: `You are registered for ${event.title}`,
      text: `Hi ${registration.name},\n\nYour registration for ${event.title} is confirmed.\nLocation: ${event.location}\nStarts: ${event.startsAt.toISOString()}\n`
    });
  }
};
