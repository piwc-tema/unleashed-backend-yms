import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
  from: process.env.EMAIL_FROM,
}));
