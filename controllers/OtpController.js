const otpService = require("../services/OtpService");

async function verifyOTP(req, res, next) {
    const { email, enteredOTP } = req.body;
    try {
        const isVerified = await otpService.verifyOTP(email, enteredOTP);
        if (isVerified) {
            res.json({ message: "OTP verified successfully" });
        } else {
            res.status(400).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        next(error);
    }
}

async function sendOtp(req, res, next) {
    const { email } = req.body;
    try {
        const result = await otpService.sendOtp(email);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = { verifyOTP, sendOtp };
