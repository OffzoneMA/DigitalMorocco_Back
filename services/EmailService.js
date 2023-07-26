const nodemailer = require('nodemailer');

async function sendEmail(userEmail, subject, emailContent, isHTML) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', 
            port: 587, 
            secure: true, 
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







module.exports = {  sendEmail }