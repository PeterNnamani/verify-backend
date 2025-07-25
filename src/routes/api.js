const express = require('express');
const router = express.Router();
const emailService = require('../services/email');

router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text, html, cookies } = req.body;
    await emailService.sendEmail({ to, subject, text, html, cookies });
    res.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;
