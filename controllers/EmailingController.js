const EmailingService = require('../services/EmailingService');

async function testEmailSending(req, res) {
  const { email, subject, htmlContent, textContent } = req.body;

  try {
    await EmailingService.testSendEmail(email, subject, htmlContent, textContent);
    res.status(200).json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
}

module.exports = {
  testEmailSending
};