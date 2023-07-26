const jwt = require('jsonwebtoken');
const EmailService = require('./EmailService');
const UserService = require('./UserService');
const User = require('../models/User');

async function sendVerificationEmail(userId) {
    try {
        const user = UserService.getUserByID(userId)
        const token = generateVerificationToken(userId);

        const verificationLink = `${process.env.BACKEND_URL}/confim_verification/${userId}?token=${token}`;

        const messageId = await EmailService.sendEmail(user.email, 'Account Verification', `Click the following link to verify your account: ${verificationLink}`,false)
       
        return messageId
    } catch (err) {
        throw err
    }
}

async function VerifyUser(userId,token) {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (userId == decoded.userId && !isTokenExpired(decoded) ){
            return await User.findByIdAndUpdate(userId, { status:'Verified'})
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
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn });
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

module.exports = { generateVerificationToken, isTokenExpired, sendVerificationEmail, VerifyUser }