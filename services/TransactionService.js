const Transaction = require('../models/Transaction');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

const getAllTransactions = async () => {
    try {
        const transactions = await Transaction.find();
        return transactions;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transactions');
    }
}

const getAllTransactionsByUser = async (userId) => {
    try {
        const transactions = await Transaction.find({ userId });
        return transactions;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transactions');
    }
}

const getAllTransactionsBySubscription = async (subscriptionId) => {
    try {
        const transactions = await Transaction.find({ subscriptionId });
        return transactions;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transactions');
    }
}

const getTransactionById = async (transactionId) => {
    try {
        const transaction = await Transaction.findById(transactionId);        
            return transaction;
    }
    catch (error) {
        console.error('Error fetching transaction:', error);
        throw new Error('Transaction not found');
    }
}

const createTransaction = async (transactionData) => {
    try {
        const transaction = new Transaction(transactionData);
        await transaction.save();
        return transaction;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw new Error('Failed to create transaction');
    }
}

const updateTransaction = async (transactionId, updateData) => {
    try {
        const transaction = await Transaction.findByIdAndUpdate(transactionId, updateData, { new: true });
        return transaction;
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw new Error('Failed to update transaction');
    }
}

const deleteTransaction = async (transactionId) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(transactionId);
        return transaction;
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw new Error('Failed to delete transaction');
    }
}

const getTransactionByInternalId = async (internalId) => {
    try {
        const transaction = await Transaction.findOne({ internalId });
        return transaction;
    } catch (error) {
        console.error('Error fetching transaction:', error);
        throw new Error('Transaction not found');
    }
}

const getTransactionByUserAndStatus = async (userId, status) => {
    try {
        const transactions = await Transaction.find({ userId, status });
        return transactions;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transactions');
    }
}

const getTransactionBySubscriptionAndStatus = async (subscriptionId, status) => {
    try {
        const transactions = await Transaction.find({ subscriptionId, status });
        return transactions;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transactions');
    }
}

module.exports = {
    getAllTransactions,
    getAllTransactionsByUser,
    getAllTransactionsBySubscription,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionByInternalId,
    getTransactionByUserAndStatus,
    getTransactionBySubscriptionAndStatus
}



