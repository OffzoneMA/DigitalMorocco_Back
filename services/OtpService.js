const OTP = require("../models/Otp");
const User = require("../models/User")
const UserLogService = require("./UserLogService")
const EmailService = require("./EmailingService")
const otpGenerator = require("otp-generator");

async function sendOtp(email) {
    try {
        const checkUserPresent = await User.findOne({ email });
        if (!checkUserPresent) {
            throw new Error("User not found.");
        }

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        const otpPayload = { email, otp };
        const otpBody = await OTP.create(otpPayload);

        await EmailService.sendVerificationOtpEmail(checkUserPresent._id , otp);
        
        // Retourner le résultat au lieu d'utiliser res
        return {
            success: true,
            message: "OTP Sent Successfully",
            otpBody,
        };
    } catch (error) {
        // Rejeter la promesse avec l'erreur
        throw new Error(error.message || "An error occurred");
    }
}


async function verifyOTP(email, enteredOTP) {
    try {
        const otpRecord = await OTP.find({ email, otp: enteredOTP }).sort({ createdAt: -1 }).limit(1);
        const user = await User.findOne({ email });

        if (otpRecord.length > 0) {
            if (enteredOTP !== otpRecord[0].otp) {
                throw new Error("The OTP is not valid");
            } else {
                if (user) {
                    await User.findByIdAndUpdate(user._id, { status: 'verified' });
                    const log = await UserLogService.createUserLog('Verified', user._id);
                    return { success: true, message: "OTP verified successfully" };
                }
            }
        } else {
            throw new Error("The OTP is not valid");
        }
    } catch (error) {
        return { success: false, message: error.message || "An error occurred" };
    }
}


module.exports = {
    sendOtp,verifyOTP
};
