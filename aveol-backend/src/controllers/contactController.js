const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');
const logger = require('../utils/logger');

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const submitContact = async (req, res) => {
  try {
    const { name, email, business, message, _honey } = req.body;

    // Honeypot check for spam protection
    if (_honey) {
      logger.warn(`Honeypot triggered from IP: ${req.ip} on contact form.`);
      return res.status(200).json({ success: true, message: 'Message sent successfully.' });
    }

    if (!name || !email || !business || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // 1. Save data to MongoDB
    const newContact = await Contact.create({
      name,
      email,
      business,
      message,
    });

    // 2. Respond to the user immediately (so email sending does not block UI)
    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
    });

    // 3. Send email asynchronously
    const mailOptions = {
      from: `"${name}" <${process.env.GMAIL_USER}>`,
      to: 'rajaditya81156@gmail.com',
      replyTo: email,
      subject: 'New Consultation Request — Aveol',
      text: `You have received a new consultation request.\n\nName: ${name}\nEmail: ${email}\nBusiness Type: ${business}\nMessage: ${message}`,
      html: `
        <h3>New Consultation Request</h3>
        <p>You have received a new consultation request from the website.</p>
        <table border="0" cellpadding="8" cellspacing="0">
          <tr>
            <td><strong>Name:</strong></td>
            <td>${name}</td>
          </tr>
          <tr>
            <td><strong>Email:</strong></td>
            <td>${email}</td>
          </tr>
          <tr>
            <td><strong>Business Type:</strong></td>
            <td>${business}</td>
          </tr>
          <tr>
            <td valign="top"><strong>Message:</strong></td>
            <td>${message.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>
      `,
    };

    try {
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        await transporter.sendMail(mailOptions);
        logger.info(`Contact email sent successfully for ${email}`);
      } else {
        logger.warn('Contact email skipped: GMAIL_USER or GMAIL_APP_PASSWORD not set in .env');
      }
    } catch (emailErr) {
      // The email failed, but we already responded 201 Created and saved to DB
      logger.error('Failed to send contact notification email:', emailErr);
    }

  } catch (err) {
    logger.error('submitContact error:', err);
    // Only send the error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }
};

module.exports = { submitContact };
