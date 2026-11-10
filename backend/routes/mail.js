const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Mail = require('../models/Mail');
const { getTransporter } = require('../config/mailer');

// Helper to validate email format
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// POST /api/mail/send - Send bulk emails
router.post('/send', async (req, res) => {
  try {
    const { subject, body, recipients, isHtml = true, sender } = req.body;

    // Validation
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Email subject is required.' });
    }
    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, message: 'Email body is required.' });
    }

    let recipientList = [];
    if (Array.isArray(recipients)) {
      recipientList = recipients.map(r => String(r).trim()).filter(Boolean);
    } else if (typeof recipients === 'string') {
      // Split by commas, semicolons, or newlines
      recipientList = recipients
        .split(/[\n,;]+/)
        .map(r => r.trim())
        .filter(Boolean);
    }

    if (recipientList.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one recipient email is required.' });
    }

    // Filter valid emails
    const validRecipients = [];
    const invalidRecipients = [];
    for (const email of recipientList) {
      if (isValidEmail(email)) {
        if (!validRecipients.includes(email.toLowerCase())) {
          validRecipients.push(email.toLowerCase());
        }
      } else {
        invalidRecipients.push(email);
      }
    }

    if (validRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid recipient email addresses found.',
        invalidRecipients,
      });
    }

    // Get nodemailer transporter
    const { transporter, fromEmail, isTest } = await getTransporter();

    const recipientDetails = [];
    let successCount = 0;
    let failedCount = 0;
    let latestPreviewUrl = null;

    // Send emails (each personalized/individual delivery)
    for (const to of validRecipients) {
      try {
        const mailOptions = {
          from: fromEmail,
          to,
          subject: subject.trim(),
          ...(isHtml ? { html: body } : { text: body }),
        };

        const info = await transporter.sendMail(mailOptions);
        
        let preview = null;
        if (isTest) {
          preview = nodemailer.getTestMessageUrl(info);
          if (preview) latestPreviewUrl = preview;
        }

        recipientDetails.push({
          email: to,
          status: 'sent',
          messageId: info.messageId,
        });
        successCount++;
      } catch (sendError) {
        console.error(`Failed to send to ${to}:`, sendError.message);
        recipientDetails.push({
          email: to,
          status: 'failed',
          error: sendError.message,
        });
        failedCount++;
      }
    }

    // Also record any initial invalid emails as failed
    for (const inv of invalidRecipients) {
      recipientDetails.push({
        email: inv,
        status: 'failed',
        error: 'Invalid email address format',
      });
      failedCount++;
    }

    const overallStatus =
      failedCount === 0
        ? 'completed'
        : successCount === 0
        ? 'failed'
        : 'partially_failed';

    // Store record in MongoDB
    const mailRecord = new Mail({
      subject: subject.trim(),
      body,
      isHtml,
      recipients: validRecipients,
      totalCount: validRecipients.length + invalidRecipients.length,
      successCount,
      failedCount,
      recipientDetails,
      previewUrl: latestPreviewUrl,
      status: overallStatus,
      sender: sender || 'Admin',
    });

    const savedRecord = await mailRecord.save();

    res.status(200).json({
      success: overallStatus !== 'failed',
      message:
        overallStatus === 'completed'
          ? `All ${successCount} emails sent successfully!`
          : overallStatus === 'partially_failed'
          ? `Sent to ${successCount} recipients, but ${failedCount} failed.`
          : 'Failed to send emails.',
      record: savedRecord,
      previewUrl: latestPreviewUrl,
      summary: {
        total: savedRecord.totalCount,
        success: successCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    console.error('Mail sending controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while sending email.',
      error: error.message,
    });
  }
});

// GET /api/mail/history - Fetch email sending history
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [total, records] = await Promise.all([
      Mail.countDocuments(),
      Mail.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    res.json({
      success: true,
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/mail/history/:id - Fetch single mail details
router.get('/history/:id', async (req, res) => {
  try {
    const record = await Mail.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Email record not found.' });
    }
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/mail/history/:id - Delete single history entry
router.delete('/history/:id', async (req, res) => {
  try {
    const deleted = await Mail.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }
    res.json({ success: true, message: 'Record deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/mail/stats - Overview statistics
router.get('/stats', async (req, res) => {
  try {
    const totalCampaigns = await Mail.countDocuments();
    const stats = await Mail.aggregate([
      {
        $group: {
          _id: null,
          totalSent: { $sum: '$successCount' },
          totalFailed: { $sum: '$failedCount' },
          totalRecipients: { $sum: '$totalCount' },
        },
      },
    ]);

    const data = stats[0] || { totalSent: 0, totalFailed: 0, totalRecipients: 0 };
    res.json({
      success: true,
      stats: {
        totalCampaigns,
        totalSent: data.totalSent,
        totalFailed: data.totalFailed,
        totalRecipients: data.totalRecipients,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

