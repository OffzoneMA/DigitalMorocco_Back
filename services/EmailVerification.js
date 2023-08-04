const jwt = require('jsonwebtoken');
const EmailService = require('./EmailService');
const UserService = require('./UserService');
const User = require('../models/User');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

async function sendVerificationEmail(userId) {
  try {
    const user = await UserService.getUserByID(userId);
    const title = 'Account Verification';
    const verificationLink = `${process.env.BACKEND_URL}/users/confirm_verification/${userId}?token=${generateVerificationToken(userId)}`;

    // Read the common email template
    const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.ejs');
    const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');

    // Read the specific body for account verification
    const accountVerificationPath = path.join(__dirname, '..', 'templates', 'accountVerification.ejs');
    const accountVerificationContent = fs.readFileSync(accountVerificationPath, 'utf-8');

    // Compile the common template with the account verification body
    const compiledTemplate = ejs.compile(commonTemplateContent);
    const htmlContent = compiledTemplate({
      title,
      body: accountVerificationContent, // Replace body with the specific content
      verificationLink,
    });

    const messageId = await EmailService.sendEmail(user.email, title, htmlContent, true);
    return messageId;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function sendUnderReviewEmail(userId) {
    try {
      const user = await UserService.getUserByID(userId);
      const title = 'Acknowledgement of Your Request - Under Review';
  
      // Read the common email template
      const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.ejs');
      const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');
  
      // Read the specific body for under review email
      const underReviewPath = path.join(__dirname, '..', 'templates', 'accountUnderReview.ejs');
      const underReviewContent = fs.readFileSync(underReviewPath, 'utf-8');
  
      // Compile the common template with the under review body
      const compiledTemplate = ejs.compile(commonTemplateContent);
      const htmlContent = compiledTemplate({
        title,
        body: underReviewContent, // Replace body with the specific content
      });
  
      const messageId = await EmailService.sendEmail(user.email, title, htmlContent, true);
      return messageId;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }


  async function sendAcceptedEmail(userId) {
    try {
      const user = await UserService.getUserByID(userId);
      const title = 'Your Request Has Been Approved!';
  
      // Read the common email template
      const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.ejs');
      const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');
  
      // Read the specific body for acceptance email
      const acceptancePath = path.join(__dirname, '..', 'templates', 'accountAccepted.ejs');
      const acceptanceContent = fs.readFileSync(acceptancePath, 'utf-8');
  
      // Compile the common template with the acceptance body
      const compiledTemplate = ejs.compile(commonTemplateContent);
      const htmlContent = compiledTemplate({
        title,
        body: acceptanceContent, // Replace body with the specific content
      });
  
      const messageId = await EmailService.sendEmail(user.email, title, htmlContent, true);
      return messageId;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  

  
  async function sendRejectedEmail(userId) {
    try {
      const user = await UserService.getUserByID(userId);
      const title = 'Rejection of Your Request - Reason Provided';
  
      // Read the common email template
      const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.ejs');
      const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');
  
      // Read the specific body for rejection email
      const rejectionPath = path.join(__dirname, '..', 'templates', 'accountRejected.ejs');
      const rejectionContent = fs.readFileSync(rejectionPath, 'utf-8');
  
      // Compile the common template with the rejection body
      const compiledTemplate = ejs.compile(commonTemplateContent);
      const htmlContent = compiledTemplate({
        title,
        body: rejectionContent, // Replace body with the specific content
      });
  
      const messageId = await EmailService.sendEmail(user.email, title, htmlContent, true);
      return messageId;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
async function VerifyUser(userId, token) {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (userId == decoded.userId && !isTokenExpired(decoded)) {
      return await User.findByIdAndUpdate(userId, { status: 'verified' });
    }
  } catch (err) {
    throw err;
  }
}

function generateVerificationToken(userId) {
  const expiresIn = '1h';
  const payload = {
    userId: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
}

function isTokenExpired(decoded) {
  try {
    if (Date.now() >= decoded.exp * 1000) {
      return true;
    }
    return false;
  } catch (err) {
    return true;
  }
}

module.exports = { generateVerificationToken, isTokenExpired, sendVerificationEmail, VerifyUser, sendRejectedEmail,sendAcceptedEmail,sendUnderReviewEmail }

