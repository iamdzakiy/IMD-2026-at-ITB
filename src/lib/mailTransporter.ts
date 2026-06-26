import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true' ? true : false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async (options: {
  to: string;
  subject: string;
  html: string;
}) => {
  return transporter.sendMail({
    from: `"The IMD 2026 at ITB - IMD 2026 at ITB" <${process.env.SMTP_USER}>`,
    replyTo: process.env.SMTP_USER,
    ...options,
  });
};
