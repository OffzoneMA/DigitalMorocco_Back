const jwt = require('jsonwebtoken');
const i18n = require('i18next');
const UserService = require('./UserService');
const InvestorService = require('./InvestorService');
const User = require('../models/User');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Event = require('../models/Event');
const TokenShortCode = require('../models/TokenShortCode')

// i18n.changeLanguage('fr');

const languages = [
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'French' },
  { id: 'es', label: 'Spanish' },
  { id: 'de', label: 'German' },
  { id: 'it', label: 'Italian' },
  { id: 'pt', label: 'Portuguese' },
  { id: 'ru', label: 'Russian' },
  { id: 'zh', label: 'Chinese' },
  { id: 'ja', label: 'Japanese' },
  { id: 'ko', label: 'Korean' },
  { id: 'ar', label: 'Arabic' },
  { id: 'hi', label: 'Hindi' },
  { id: 'tr', label: 'Turkish' },
  { id: 'nl', label: 'Dutch' },
  { id: 'pl', label: 'Polish' },
  { id: 'sv', label: 'Swedish' },
  { id: 'fi', label: 'Finnish' },
  { id: 'da', label: 'Danish' },
  { id: 'no', label: 'Norwegian' },
  { id: 'el', label: 'Greek' },
];

function getLanguageIdByLabel(label) {
  const language = languages.find(lang => lang.label === label);
  return language ? language.id : null;
}

async function saveShortCodeToTokenMapping(shortCode, token) {
  const shortCodeEntry = new TokenShortCode({ shortCode, token });
  return await shortCodeEntry.save();
}

async function getTokenFromShortCode(shortCode) {
  const shortCodeEntry = await TokenShortCode.findById(shortCode);
  if (shortCodeEntry) {
    return shortCodeEntry.token;
  }
  return null;
}

const SHORT_CODE_SECRET = process.env.SHORT_CODE_SECRET || '28103bclqaponul71gjqkjpomllaxwvi';


function generateShortCodeFromToken(token, userId) {
  const data = `${token}-${userId}-${Date.now()}`;
  return crypto.createHmac('sha256', SHORT_CODE_SECRET)
               .update(data)
               .digest('hex')
               .slice(0, 20); 
}

async function sendEmail(userEmail, subject, emailContent, isHTML) {
  const transporter = nodemailer.createTransport({
    host: 'mail.digitalmorocco.net',
    port: 465,
    secure: true,
    // host: "smtp.gmail.com",
    // port: 587,
    // secure: false,
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
    tls: {
      rejectUnauthorized: false,
    },
    //  logger: true, 
    // debug: true
  });

  const emailOptions = {
    from: process.env.email,
    to: userEmail,
    subject: subject,
    [isHTML ? 'html' : 'text']: emailContent,
  };

  return await transporter.sendMail(emailOptions);

}

async function sendContactFromWeb( email, subject, emailContent, isHTML) {
  const transporter = nodemailer.createTransport({
    host: 'mail.digitalmorocco.net',
    port: 465,
    secure: true,
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
    tls: {
      rejectUnauthorized: false,
    },
    // logger: true, 
    // debug: true
  });
  const emailOptions = {
    from: process.env.email,
    to: 'contact@offzone.net',
    subject: subject,
    [isHTML ? 'html' : 'text']: emailContent,
  };

  try {
    const info = await transporter.sendMail(emailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }


}


//Users
async function sendVerificationEmail(userId , language) {
  try {
    const user = await User.findById(userId);

    const userLanguage = language || getLanguageIdByLabel(user?.language);

    if(userLanguage) {
      await i18n.changeLanguage(userLanguage);
    }
    const title = i18n.t('verify_title');

    const token = generateVerificationToken(userId);

    const shortCode = generateShortCodeFromToken(token , userId);

    const saved = await saveShortCodeToTokenMapping(shortCode, token);

    const verificationLink = `${process.env.BACKEND_URL}/verify/${saved?._id}`;

    const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate1.ejs');
    // const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');

    const accountVerificationPath = path.join(__dirname, '..', 'templates', 'accountVerification1.ejs');
    // const accountVerificationContent = fs.readFileSync(accountVerificationPath, 'utf-8');

    // Attendre la résolution des promesses renderFile
    const compiledTemplate2 = await ejs.renderFile(accountVerificationPath, {t: i18n.t.bind(i18n), verificationLink });

    const compiledTemplate = await ejs.renderFile(commonTemplatePath, {t: i18n.t.bind(i18n) , title, body: compiledTemplate2 });

    const messageId = await sendEmail(user.email, title, compiledTemplate, true);
    return messageId;
  } catch (err) {
    throw err;
  }
}

async function sendContactEmail(firstName , lastName , email , phone , message) {

    try {
      const title = 'Contact Message from Digital Morocco';

      const contactSitePath = path.join(__dirname, '..', 'templates', 'contactSite.ejs');
      const contactSiteContent = fs.readFileSync(contactSitePath, 'utf-8');
  
      const compiledTemplate2 = ejs.compile(contactSiteContent)
  
      const htmlContent2 = compiledTemplate2({
        title,
        firstName,
        lastName,
        email,
        phone,
        message
      });

      const messageId = await sendContactFromWeb(email, title, htmlContent2, true);
      return messageId;
    } catch (error) {
      throw error;
    }
}

async function sendContactEmailConfirm(firstName , lastName , email , message , language) {

  try {

    if(language) {
      await i18n.changeLanguage(language);
    }
    
    const title = i18n.t('contactSite.confirm.subject');

    const contactSitePath = path.join(__dirname, '..', 'templates', 'contactConfirm.ejs');
    const contactSiteContent = fs.readFileSync(contactSitePath, 'utf-8');

    const compiledTemplate2 = ejs.compile(contactSiteContent)

    const htmlContent2 = compiledTemplate2({
      t: i18n.t.bind(i18n),
      title,
      name: `${firstName} ${lastName}`,
      message
    });

    const messageId = await sendEmail(email, title, htmlContent2, true);
    return messageId;
  } catch (error) {
    throw error;
  }
}

async function sendVerificationOtpEmail(userId , otpCode) {
  try {
    const user = await User.findById(userId);
    const title = 'Account Verification';

    const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.ejs');
    const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');

    const accountVerificationPath = path.join(__dirname, '..', 'templates', 'accountVerificationOtp.ejs');
    const accountVerificationContent = fs.readFileSync(accountVerificationPath, 'utf-8');

    const compiledTemplate = ejs.compile(commonTemplateContent);
    const compiledTemplate2 = ejs.compile(accountVerificationContent);

    const htmlContent2 = compiledTemplate2({
      otpCode,
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

async function sendForgotPasswordEmail(userId , language) {
    try {
      const user = await User.findById(userId);
      const userLanguage = language || getLanguageIdByLabel(user?.language) ;

      if(userLanguage) {
        await i18n.changeLanguage(userLanguage);
      }
      const title = i18n.t('reset_password.title');

      const token = generateForgotPassworToken(userId);

      const resetPasswordLink = `${process.env.FRONTEND_URL}/ResetPassword?token=${token}`;
      
      const resetPasswordPath = path.join(__dirname, '..', 'templates', 'resetPassword1.ejs');
      const resetPasswordContent = await ejs.renderFile(resetPasswordPath, {t: i18n.t.bind(i18n),title , resetPasswordLink });

      const messageId = await sendEmail(user.email, title, resetPasswordContent, true);
      return messageId;

    } catch (error) {
      console.log(error)
      throw error;
    }

}

async function sendUnderReviewEmail(userId , lang) {
    try {
      const user = await User.findById(userId);
      const userLanguage = lang || getLanguageIdByLabel(user?.language) ;

      if(userLanguage) {
        await i18n.changeLanguage(userLanguage);
      }

      const title = i18n.t('ack_request.email_subject');
  
      // const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.ejs');
      // const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');
  
      const underReviewPath = path.join(__dirname, '..', 'templates', 'underReview.ejs');
      const underReviewContent = await ejs.renderFile(underReviewPath, {t: i18n.t.bind(i18n),title, name: user?.displayName });

      // const underReviewContent = fs.readFileSync(underReviewPath, 'utf-8');
  
      // const compiledTemplate = ejs.compile(commonTemplateContent);

      // const htmlContent = compiledTemplate({
      //   title,
      //   body: underReviewContent,
      // });

  
      const messageId = await sendEmail(user.email, title, underReviewContent, true);
      return messageId;
    } catch (err) {
      throw err;
    }
  }

async function sendAcceptedEmail(userId) {
    try {
      const user = await User.findById(userId);

      const userLanguage = getLanguageIdByLabel(user?.language);

      if(userLanguage) {
        await i18n.changeLanguage(userLanguage);
      }
      const title = i18n.t('request_approved.title');
  
      const requestApprovedPath = path.join(__dirname, '..', 'templates', 'requestApproved.ejs');
      const requestApprovedContent = await ejs.renderFile(requestApprovedPath, {t: i18n.t.bind(i18n),title , name : user?.displayName });

  
      const messageId = await sendEmail(user.email, title, requestApprovedContent, true);
      return messageId;
    } catch (err) {
      throw err;
    }
  }
  
async function sendRejectedEmail(userId) {
    try {
      const user = await User.findById(userId);
      const userLanguage = getLanguageIdByLabel(user?.language) ;

      if(userLanguage) {
        await i18n.changeLanguage(userLanguage);
      }
      const title = i18n.t('request_reject.title');
  
      const rejectionPath = path.join(__dirname, '..', 'templates', 'rejectionRequest.ejs');
      const requestRejectContent = await ejs.renderFile(rejectionPath, {t: i18n.t.bind(i18n),title , name : user?.displayName });
  
      const messageId = await sendEmail(user.email, title, requestRejectContent, true);
      return messageId;
    } catch (err) {
      throw err;
    }
  }

// async function VerifyUser(userId, token) {
//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     if (userId == decoded.userId && !isTokenExpired(decoded)) {
//       return await User.findByIdAndUpdate(userId, { status: 'verified' });
//     }
//   } catch (err) {
//     throw err;
//   }
// }

async function VerifyUser(shortCode) {
  try {
    const token = await getTokenFromShortCode(shortCode);
    if (!token) {
      throw new Error('Invalid code');
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (decoded?.userId && !isTokenExpired(decoded)) {
      return await User.findByIdAndUpdate(decoded.userId, { status: 'verified' });
      // return await User.findById(userId);
    }
  } catch (err) {
    throw err;
  }
}

async function verifyResetToken(token) {
  try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if(decoded.userId) {
        return await User.findById(decoded.userId);
      }
  } catch (error) {
      throw new Error({error : 'Invalid Token'});
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


const sendNewProjectShareRequestEmail = async (userId, companyName, country, project) => {
  const user = await User.findById(userId);
  const title = `New Project Share Request from ${companyName}`;
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

};

async function sendContactAcceptToMember(userId, InvestorName, linkedin_link, eventDate) {
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
      eventDate: new Date(eventDate).toLocaleDateString('en-US', {
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

async function sendContactRejectToMember(userId, InvestorName, linkedin_link, eventDate) {
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
      eventDate: new Date(eventDate).toLocaleDateString('en-US', {
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

//Events
async function sendTicketToUser(billingData, eventId){
  try {
    const event = await Event.findById(eventId);
    const title = 'Get Ready - Your Exclusive Event Ticket Details';

    const commonTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.ejs');
    const commonTemplateContent = fs.readFileSync(commonTemplatePath, 'utf-8');

    const eventTicketInfoPath = path.join(__dirname, '..', 'templates', 'eventTicketInfo.ejs');
    const eventTicketInfoContent = fs.readFileSync(eventTicketInfoPath, 'utf-8');

    const compiledTemplate = ejs.compile(commonTemplateContent);
    const compiledTemplate2 = ejs.compile(eventTicketInfoContent);

    const htmlContent2 = compiledTemplate2({
      AttendeeName: `${billingData?.firstName} ${billingData?.lastName}`,
      eventDate: new Date(eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      eventTitle : event.title,
      eventTime: `${formatTime(event.startTime)} - ${formatTime(event.endTime)} ${getTimezoneOffset(event.startTime)}`,
      eventZoomLink: event.zoomLink,
      eventZoomId: event.zoomMeetingID,
      eventZoomPassword: event.zoomPasscode,
    });

    const htmlContent = compiledTemplate({
      title,
      body: htmlContent2,
    });

    const messageId = await sendEmail(billingData.email, title, htmlContent, true);
    return messageId;

  } catch (error) {
    throw error;
  }
}

function formatTime(time) {
  const formattedTime = new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  return formattedTime;
}

function getTimezoneOffset(time) {
  const eventDate = new Date(`2000-01-01T${time}`);
  const offset = eventDate.getTimezoneOffset();
  
  return offset === -60 ? '+01' : ''; // If offset is -60 minutes, it's GMT+1
}


function generateVerificationToken(userId) {
  const expiresIn = '1h';
  const payload = {
    userId: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
}

function generateForgotPassworToken(userId) {
  const expiresIn = '30min';
  const payload = {
    userId: userId
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET , {expiresIn: expiresIn});
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

module.exports = { sendEmail, generateVerificationToken, isTokenExpired, generateForgotPassworToken, 
  sendNewContactRequestEmail, sendContactAcceptToMember,sendContactRejectToMember,
  sendVerificationEmail, sendVerificationOtpEmail, VerifyUser, sendRejectedEmail,sendAcceptedEmail,
  sendUnderReviewEmail,sendForgotPasswordEmail,verifyResetToken , sendTicketToUser , sendContactEmail ,
getTokenFromShortCode , generateShortCodeFromToken , saveShortCodeToTokenMapping , sendContactEmailConfirm , 
sendNewProjectShareRequestEmail , getLanguageIdByLabel}

