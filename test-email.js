const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      debug: true
    });

    console.log('Testing email configuration...');
    console.log('Email User:', process.env.EMAIL_USER);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'peternnamani001@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email to verify the email sending functionality.',
      html: '<h1>Test Email</h1><p>This is a test email to verify the email sending functionality.</p>'
    });

    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

testEmail();
