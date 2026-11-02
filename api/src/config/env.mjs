if (process.env.NODE_ENV !== 'test') {
  try {
    process.loadEnvFile();
  } catch {
    // A .env file is optional; production hosts normally inject variables.
  }
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  logLevel: process.env.LOG_LEVEL || 'info',
  dbStorage: process.env.DB_STORAGE || './data/events.sqlite',
  smtpUrl: process.env.SMTP_URL || '',
  mailFrom: process.env.MAIL_FROM || 'Campus Events <no-reply@campus-events.local>',
  mailTimeoutMs: Number(process.env.MAIL_TIMEOUT_MS || 5_000),
  cacheTtlMs: Number(process.env.CACHE_TTL_MS || 30_000)
});
