import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'peternnamani001@gmail.com',
    pass: process.env.EMAIL_PASS || 'yygzcdttgthuhicg'
  }
});

// Middleware
app.use(cors({
  origin: ['https://verilifyauth.netlify.app', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running! Updated: ' + new Date().toISOString() });
});

// Email route
app.post('/api/send-email', async (req, res) => {
  console.log('Received email request:', req.body);
  try {
    const { to, subject, text, html, cookies } = req.body;
    
    const mailOptions = {
      from: 'peternnamani001@gmail.com',
      to,
      subject,
      text,
      html
    };

    console.log('Sending email with options:', mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    res.json({ 
      success: true, 
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  
  // Test email configuration
  transporter.verify()
    .then(() => console.log('Email configuration verified successfully'))
    .catch(err => console.error('Email configuration error:', err));
});
