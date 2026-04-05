import nodemailer from 'nodemailer';
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n\n=== MOCK EMAIL DISPATCH ===\nTo: ${to}\nSubject: ${subject}\nText: ${text}\n===========================\n\n`);
      return;
    }
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: false, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    const info = await transporter.sendMail({
      from: `"SmartCert Alerts" <${process.env.SMTP_USER || 'no-reply@smartcert.io'}>`,
      to,
      subject,
      text,
      html
    });
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    console.error('Error sending email:', err);
  }
};
export default sendEmail;
