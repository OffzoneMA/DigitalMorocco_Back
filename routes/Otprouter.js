const express = require("express");
const router = express.Router();
const otpController = require("../controllers/OtpController");

/**
 * @swagger
 * tags:
 *   name: OTP
 *   description: Operations related to OTP
 */

/**
 * @swagger
 * /users/otp/verify:
 *   post:
 *     summary: Verify OTP for email verification
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               enteredOTP:
 *                 type: string
 *             example:
 *               email: user@example.com
 *               enteredOTP: "123456"
 *     responses:
 *       200:
 *         description: Successful operation. Returns a message indicating successful verification.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "OTP verified successfully"
 *       400:
 *         description: Invalid OTP. Returns a message indicating failure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Invalid OTP"
 */
router.post("/verify", otpController.verifyOTP);

/**
 * @swagger
 * /users/otp/send:
 *   post:
 *     summary: Send OTP to the specified email
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             example:
 *               email: user@example.com
 *     responses:
 *       200:
 *         description: Successful operation. Returns a message indicating success.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 otpBody:
 *                   type: object
 *             example:
 *               success: true
 *               message: "OTP Sent Successfully"
 *               otpBody: { email: "user@example.com", otp: "123456", createdAt: "2022-03-08T12:00:00.000Z" }
 *       404:
 *         description: User not found. Returns a message indicating failure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "User not found."
 *       500:
 *         description: Internal server error.
 */
router.post("/send", otpController.sendOtp);

module.exports = router;
