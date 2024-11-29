const PaymentMethodService = require('../services/PayementMethodService');
const UserService = require('../services/UserService');
const UserLogService = require('../services/UserLogService');
const User = require('../models/User');
const { captureRejectionSymbol } = require('nodemailer/lib/xoauth2');

// Get all payment methods for a user
async function getPaymentMethods(req, res) {
    try {
        const userId = req.userId;
        const user = await UserService.getUserByID(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const paymentMethods = await PaymentMethodService.getPaymentMethods(userId);
        return res.status(200).json(paymentMethods);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// Add a new payment method for a user
async function addPaymentMethod(req, res) {
    try {
        const userId = req.userId;
        const data = req.body;
        const user = await UserService.getUserByID(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const newPaymentMethod = await PaymentMethodService.addPaymentMethod(userId, data);
        return res.status(201).json(newPaymentMethod);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// Update a payment method for a user
async function updatePaymentMethod(req, res) {
    try {
        const userId = req.userId;
        const paymentMethodId = req.params.paymentMethodId;
        const data = req.body;
        const user = await UserService.getUserByID(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const updatedPaymentMethod = await PaymentMethodService.updatePaymentMethod(userId, paymentMethodId, data);
        return res.status(200).json(updatedPaymentMethod);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// Delete a payment method for a user
async function deletePaymentMethod(req, res) {
    try {
        const userId = req.userId;
        const paymentMethodId = req.params.paymentMethodId;
        const user = await UserService.getUserByID(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' }); 
        }
        await PaymentMethodService.deletePaymentMethod(userId, paymentMethodId);
        return res.status(204).json({ message: 'Payment method deleted successfully.' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function getLastPaiementMethod(req , res) {
    try {
        const userId = req.userId;
        const user = await UserService.getUserByID(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const paymentMethod = await PaymentMethodService.getLastPaiementMethod(userId);
        return res.status(200).json(paymentMethod);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function getPaymentMethodById(req, res) {
    try {
        const paymentMethodId = req.params.paymentMethodId;
        const paymentMethod = await PaymentMethodService.getPaymentMethodById(paymentMethodId);
        return res.status(200).json(paymentMethod);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod, getPaymentMethodById ,
    deletePaymentMethod,
    getLastPaiementMethod
};