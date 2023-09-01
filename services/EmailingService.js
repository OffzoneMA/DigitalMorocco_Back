const jwt = require('jsonwebtoken');
const UserService = require('./UserService');
const InvestorService = require('./InvestorService');
const User = require('../models/User');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

async function sendEmail(userEmail, subject, emailContent, isHTML) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });

  const emailOptions = {
    from: process.env.email,
    to: userEmail,
    subject: subject,
    [isHTML ? 'html' : 'text']: emailContent,
  };

  return await transporter.sendMail(emailOptions);

}

//Users
async function sendVerificationEmail(userId) {
  try {
    const user = await User.findById(userId);
    const title = 'Account Verification';
    const verificationLink = `${process.env.BACKEND_URL}/users/confirm_verification/${userId}?token=${generateVerificationToken(userId)}`;

    const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.ejs');
    const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');

    const accountVerificationPath = path.join(__dirname, '..', 'templates', 'accountVerification.ejs');
    const accountVerificationContent = fs.readFileSync(accountVerificationPath, 'utf-8');

    const compiledTemplate = ejs.compile(commonTemplateContent);
    const compiledTemplate2 = ejs.compile(accountVerificationContent);

    const htmlContent2 = compiledTemplate2({
      verificationLink,
    });

    const htmlContent = compiledTemplate({
      title,
      body: htmlContent2,
    });

    const messageId = await sendEmail(user.email, title, htmlContent, true);
    return messageId;
  } catch (err) {
    throw err;
  }
}

async function sendUnderReviewEmail(userId) {
    try {
      const user = await User.findById(userId);
      const title = 'Acknowledgement of Your Request - Under Review';
  
      const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.ejs');
      const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');
  
      const underReviewPath = path.join(__dirname, '..', 'templates', 'accountUnderReview.ejs');
      const underReviewContent = fs.readFileSync(underReviewPath, 'utf-8');
  
      const compiledTemplate = ejs.compile(commonTemplateContent);

      const htmlContent = compiledTemplate({
        title,
        body: underReviewContent,
      });

  
      const messageId = await sendEmail(user.email, title, htmlContent, true);
      return messageId;
    } catch (err) {
      throw err;
    }
  }

async function sendAcceptedEmail(userId) {
    try {
      const user = await User.findById(userId);
      const title = 'Your Request Has Been Approved!';
  
      const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.ejs');
      const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');
  
      const acceptancePath = path.join(__dirname, '..', 'templates', 'accountAccepted.ejs');
      const acceptanceContent = fs.readFileSync(acceptancePath, 'utf-8');
  
      const compiledTemplate = ejs.compile(commonTemplateContent);
      const htmlContent = compiledTemplate({
        title,
        body: acceptanceContent, 
      });
  
      const messageId = await sendEmail(user.email, title, htmlContent, true);
      return messageId;
    } catch (err) {
      throw err;
    }
  }
  
async function sendRejectedEmail(userId) {
    try {
      const user = await User.findById(userId);
      const title = 'Rejection of Your Request - Reason Provided';
  
      const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.ejs');
      const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');
  
      const rejectionPath = path.join(__dirname, '..', 'templates', 'accountRejected.ejs');
      const rejectionContent = fs.readFileSync(rejectionPath, 'utf-8');
  
      const compiledTemplate = ejs.compile(commonTemplateContent);
      const htmlContent = compiledTemplate({
        title,
        body: rejectionContent, 
      });
  
      const messageId = await sendEmail(user.email, title, htmlContent, true);
      return messageId;
    } catch (err) {
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



//Investors
async function sendNewContactRequestEmail(userId, companyName,country) {
  try {
    const user = await User.findById(userId);
    const title = 'New Contact Request Notification';
    const link = `${process.env.FRONTEND_URL}/Dashboard_investor#Contact Requests`;

    const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.ejs');
    const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');

    const contactRequestPath = path.join(__dirname, '..', 'templates', 'contactRequest.ejs');
    const contactRequestContent = fs.readFileSync(contactRequestPath, 'utf-8');

    const compiledTemplate = ejs.compile(commonTemplateContent);
    const compiledTemplate2 = ejs.compile(contactRequestContent);

    const htmlContent2 = compiledTemplate2({
      link,
      companyName,
      country
    });

    const htmlContent = compiledTemplate({
      title,
      body: htmlContent2,
    });

   const messageId = await sendEmail(user.email, title, htmlContent, true);
    return messageId;
  } catch (err) {
    throw err;
  }
}

async function sendContactAcceptToMember(userId, InvestorName, linkedin_link, reqDate) {
  try {
     const user = await User.findById(userId);
    const title = 'Your contact request has been accepted! ';
    const link = `${process.env.FRONTEND_URL}/Dashboard_member#Contacts`;

    const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.ejs');
    const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');

    const contactRequestAcceptedPath = path.join(__dirname, '..', 'templates', 'contactRequestAccepted.ejs');
    const contactRequestAcceptedContent = fs.readFileSync(contactRequestAcceptedPath, 'utf-8');

    const compiledTemplate = ejs.compile(commonTemplateContent);
    const compiledTemplate2 = ejs.compile(contactRequestAcceptedContent);

    const htmlContent2 = compiledTemplate2({
      link,
      InvestorName: InvestorName ? InvestorName : "No Name Specified",
      linkedin_link,
      reqDate: new Date(reqDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit'
      })

    });

    const htmlContent = compiledTemplate({
      title,
      body: htmlContent2,
    });

    const messageId = await sendEmail(user.email, title, htmlContent, true);
    return messageId;
  } catch (err) {
    throw err;
  }
}

async function sendContactRejectToMember(userId, InvestorName, linkedin_link, reqDate) {
  try {
     const user = await User.findById(userId);
    const title = 'Your contact request has been rejected! ';
    const link = `${process.env.FRONTEND_URL}/Dashboard_member#Contact%20Requests`;

    const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.ejs');
    const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');

    const contactRequestRejectedPath = path.join(__dirname, '..', 'templates', 'contactRequestRejected.ejs');
    const contactRequestRejectedContent = fs.readFileSync(contactRequestRejectedPath, 'utf-8');

    const compiledTemplate = ejs.compile(commonTemplateContent);
    const compiledTemplate2 = ejs.compile(contactRequestRejectedContent);

    const htmlContent2 = compiledTemplate2({
      link,
      InvestorName: InvestorName ? InvestorName : "No Name Specified",
      linkedin_link,
      reqDate: new Date(reqDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit'
      })

    });

    const htmlContent = compiledTemplate({
      title,
      body: htmlContent2,
    });

    const messageId = await sendEmail(user.email, title, htmlContent, true);
    return messageId;
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

module.exports = { sendEmail, generateVerificationToken, isTokenExpired, sendNewContactRequestEmail, sendContactAcceptToMember,sendContactRejectToMember,sendVerificationEmail, VerifyUser, sendRejectedEmail,sendAcceptedEmail,sendUnderReviewEmail }

