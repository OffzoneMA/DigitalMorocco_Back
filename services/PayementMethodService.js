const PaymentMethod = require('../models/PaymentMethod');
const UserService = require('../services/UserService');
const UserLogService = require('../services/UserLogService');

// Get all payment methods for a user
async function getPaymentMethods(userId) {
    try {
        const user = await UserService.getUserByID(userId);
        if (!user) {
            throw new Error('User not found.');
        }
        const paymentMethods = await PaymentMethod.find({ userId: userId });
        return paymentMethods;
    } catch (err) {
        throw err;
    }
}

async function getLastPaiementMethod(userId) {
    try {
        const user = await UserService.getUserByID(userId);
        if (!user) {
            throw new Error('User not found.');
        }
        const paymentMethod = await PaymentMethod.findOne({ userId: userId });
        return paymentMethod;
    } catch (err) {
        throw err; 
    }
}

async function getPaymentMethodById(paymentMethodId) {
    try {
        const paymentMethod = await PaymentMethod.findById(paymentMethodId);
        if (!paymentMethod) {
            throw new Error('Payment method not found.');
        }
        return paymentMethod;
    } catch (err) {
        throw err;
    }
}

// Add a new payment method for a user
async function addPaymentMethod(userId, data) {
    try {
        const user = await UserService.getUserByID(userId);
        if (!user) {
            throw new Error('User not found.');
        }
        const newPaymentMethod = await PaymentMethod.create({
            userId: userId,
            paymentMethodType: data.paymentMethodType,
            paymentMethod: data.paymentMethod,
            cardName: data.cardName,
            cardNumber: data.cardNumber,
            expiryDate: data.expiryDate,
            expiryMonth: data.expiryMonth,
            expiryYear: data.expiryYear,
            cvv: data.cvv
        });
        const logData = {
            type: 'Add Payment Method',
            notes: `User added a payment method: ${data.paymentMethodType} ending in ${data.cardNumber.slice(-4)}.`, 
        };
        await UserLogService.addUserLog(userId, logData);
        return newPaymentMethod;
    } catch (err) {
        throw err;
    }
}


// Update a payment method for a user
async function updatePaymentMethod(userId, paymentMethodId, data) {
    try {
        const user = await UserService.getUserByID(userId);
        if (!user) {
            throw new Error('User not found.');
        }
        const paymentMethod = await PaymentMethod.findById(paymentMethodId);
        if (!paymentMethod) {
            throw new Error('Payment method not found.');
        }
        paymentMethod.paymentMethodType = data.paymentMethodType;
        paymentMethod.paymentMethod = data.paymentMethod;
        paymentMethod.cardName = data.cardName;
        paymentMethod.cardNumber = data.cardNumber;
        paymentMethod.expiryDate = data.expiryDate;
        paymentMethod.expiryMonth = data.expiryMonth;
        paymentMethod.expiryYear = data.expiryYear;
        paymentMethod.cvv = data.cvv; 
        await paymentMethod.save();
        const logData = {
            type: 'Update Payment Method',
            notes: `User updated a payment method: ${data.paymentMethodType} ending in ${data.cardNumber.slice(-4)}.`, 
        };
        await UserLogService.addUserLog(userId, logData);
        return paymentMethod; 
    } catch (err) {
        throw err;
    }
}

// Delete a payment method for a user
async function deletePaymentMethod(userId, paymentMethodId) {
    try {
        const user = await UserService.getUserByID(userId);
        if (!user) {
            throw new Error('User not found.');
        }
        const paymentMethod = await PaymentMethod.findById(paymentMethodId);
        if (!paymentMethod) {
            throw new Error('Payment method not found.');
        }
        await paymentMethod.remove();
        const logData = {
            type: 'Delete Payment Method',
            notes: `User deleted a payment method: ${paymentMethod.paymentMethodType} ending in ${paymentMethod.cardNumber.slice(-4)}.`, 
        };
        await UserLogService.addUserLog(userId, logData);
        return paymentMethod; 
    } catch (err) {
        throw err;
    }
}

module.exports = {
    getPaymentMethods, getPaymentMethodById ,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    getLastPaiementMethod
}
