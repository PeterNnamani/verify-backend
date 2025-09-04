const nodemailer = require('nodemailer');
require('dotenv').config(); // Properly load environment variables

// Use more reliable configuration matching the working test files
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use secure connection
  auth: {
    user: process.env.EMAIL_USER || 'peternnamani001@gmail.com',
    pass: process.env.EMAIL_PASS || 'yygzcdttgthuhicg'
  },
  tls: {
    rejectUnauthorized: false // Help with some SSL issues
  }
});

const sendEmail = async ({ to, subject, text, html, cookies }) => {
  try {
    console.log('Sending email with service:', { to, subject });
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'peternnamani001@gmail.com',
      to,
      subject,
      text,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully with service:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed in service:', error);
    throw error;
  }
};

// Verify the transporter on module load
transporter.verify()
  .then(() => console.log('Email service transporter verified successfully'))
  .catch(err => console.error('Email service transporter error:', err));

module.exports = {
  sendEmail,
  transporter // Export the transporter for direct use if needed
};
