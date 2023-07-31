const jwt = require('jsonwebtoken');
const EmailService = require('./EmailService');
const UserService = require('./UserService');
const User = require('../models/User');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

async function sendVerificationEmail(userId) {
    try {

        const user = await UserService.getUserByID(userId)

        const token = generateVerificationToken(userId);

        const verificationLink = `${process.env.BACKEND_URL}/users/confirm_verification/${userId}?token=${token}`;
        // Read the EJS template file
        const templatePath = path.join(__dirname,'..','templates', 'verification_template.ejs');
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
    // Compile the EJS template with user-specific data
        const compiledTemplate = ejs.compile(templateContent);
        const htmlContent = compiledTemplate({ em: user.email, verificationLink });
        const messageId = await EmailService.sendEmail(user.email, 'Account Verification',htmlContent ,true)
       
        return messageId
    } catch (err) {
        console.log(err)
        throw err
    }
}

async function sendUnderReviewEmail(userId) {
    try {

        const user = await UserService.getUserByID(userId)


        // Read the EJS template file
        const templatePath = path.join(__dirname, '..', 'templates', 'accountUnderReview_template.ejs');
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        // Compile the EJS template with user-specific data
        const compiledTemplate = ejs.compile(templateContent);
        const htmlContent = compiledTemplate({ Page: `${process.env.FRONTEND_URL}/Complete_SignUp` });
        const messageId = await EmailService.sendEmail(user.email, 'Acknowledgement of Your Request - Under Review', htmlContent, true)
        return messageId
    } catch (err) {
        console.log(err)
        throw err
    }
}

async function sendAcceptedEmail(userId) {
    try {

        const user = await UserService.getUserByID(userId)


        // Read the EJS template file
        const templatePath = path.join(__dirname, '..', 'templates', 'accountAccepted_template.ejs');
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        // Compile the EJS template with user-specific data
        const compiledTemplate = ejs.compile(templateContent);
        const htmlContent = compiledTemplate({ Page: `${process.env.FRONTEND_URL}/Complete_SignUp` });
        const messageId = await EmailService.sendEmail(user.email, 'Your Request Has Been Approved!', htmlContent, true)
        return messageId
    } catch (err) {
        console.log(err)
        throw err
    }
}

async function sendRejectedEmail(userId) {
    try {

        const user = await UserService.getUserByID(userId)


        // Read the EJS template file
        const templatePath = path.join(__dirname, '..', 'templates', 'accountRejected_template.ejs');
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        // Compile the EJS template with user-specific data
        const compiledTemplate = ejs.compile(templateContent);
        const htmlContent = compiledTemplate({ Page: `${process.env.FRONTEND_URL}/Complete_SignUp` });
        const messageId = await EmailService.sendEmail(user.email, 'Rejection of Your Request - Reason Provided', htmlContent, true)
        return messageId
    } catch (err) {
        console.log(err)
        throw err
    }
}


async function VerifyUser(userId,token) {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (userId == decoded.userId && !isTokenExpired(decoded) ){
            return await User.findByIdAndUpdate(userId, { status:'verified'})
        }
    } catch (err) {
        throw err
    }
}


function generateVerificationToken(userId) {
    const expiresIn = '1h'; 
    const payload = {
        userId: userId,
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
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