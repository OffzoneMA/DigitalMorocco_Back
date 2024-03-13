const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { sendContactRejectToMember } = require('../services/EmailingService');
const User = require('../models/User');
const { sendEmail } = require('../services/EmailService');

jest.mock('fs');
jest.mock('path');
jest.mock('ejs');
jest.mock('../models/User');
jest.mock('../services/EmailService');

describe('EmailingService', () => {
  describe('sendContactRejectToMember', () => {
    it('should send a rejection email to the member', async () => {
      const userId = 'user-id';
      const InvestorName = 'John Doe';
      const linkedin_link = 'https://linkedin.com/in/johndoe';
      const reqDate = '2022-01-01T12:00:00Z';
      const email = 'test@example.com';
      const title = 'Your contact request has been rejected! ';
      const link = 'https://example.com/Dashboard_member#Contact%20Requests';
      const htmlContent = '<html><body>Rejection email content</body></html>';
      const messageId = 'message-id';

      User.findById.mockResolvedValueOnce({ email });
      fs.readFileSync.mockReturnValueOnce('commonTemplateContent');
      fs.readFileSync.mockReturnValueOnce('contactRequestRejectedContent');
      ejs.compile.mockReturnValueOnce(() => htmlContent);
      ejs.compile.mockReturnValueOnce(() => htmlContent);
      sendEmail.mockResolvedValueOnce(messageId);

      const result = await sendContactRejectToMember(userId, InvestorName, linkedin_link, reqDate);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(fs.readFileSync).toHaveBeenCalledWith('commonTemplatePath', 'utf-8');
      expect(fs.readFileSync).toHaveBeenCalledWith('contactRequestRejectedPath', 'utf-8');
      expect(ejs.compile).toHaveBeenCalledWith('commonTemplateContent');
      expect(ejs.compile).toHaveBeenCalledWith('contactRequestRejectedContent');
      expect(sendEmail).toHaveBeenCalledWith(email, title, htmlContent, true);
      expect(result).toBe(messageId);
    });

    it('should throw an error if user is not found', async () => {
      const userId = 'user-id';
      const InvestorName = 'John Doe';
      const linkedin_link = 'https://linkedin.com/in/johndoe';
      const reqDate = '2022-01-01T12:00:00Z';

      User.findById.mockResolvedValueOnce(null);

      await expect(sendContactRejectToMember(userId, InvestorName, linkedin_link, reqDate)).rejects.toThrow('User not found!');
    });
  });
});