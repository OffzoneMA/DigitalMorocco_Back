const TransactionService = require('../services/TransactionService');

const getAllTransactions = async (req, res) => {
    try {
        const transactions = await TransactionService.getAllTransactions();
        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions'
        });
    }
}

const getAllTransactionsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const transactions = await TransactionService.getAllTransactionsByUser(userId);
        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions'
        });
    }
}

const getAllTransactionsBySubscription = async (req, res) => {
    try {
        const subscriptionId = req.params.subscriptionId;
        const transactions = await TransactionService.getAllTransactionsBySubscription(subscriptionId);
        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions'
        });
    }
}

const getTransactionById = async (req, res) => {
    try {
        const transactionId = req.params.transactionId;
        const transaction = await TransactionService.getTransactionById(transactionId);
        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Transaction not found'
        });
    }
}

const createTransaction = async (req, res) => {
    try {
        const transactionData = req.body;
        const transaction = await TransactionService.createTransaction(transactionData);
        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create transaction'
        });
    }
}

const updateTransaction = async (req, res) => {
    try {
        const transactionId = req.params.transactionId;
        const updateData = req.body;
        const transaction = await TransactionService.updateTransaction(transactionId, updateData);
        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update transaction'
        });
    }
}

const deleteTransaction = async (req, res) => {
    try {
        const transactionId = req.params.transactionId;
        await TransactionService.deleteTransaction(transactionId);
        res.status(200).json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete transaction'
        });
    }
}

module.exports = {
    getAllTransactions,
    getAllTransactionsByUser,
    getAllTransactionsBySubscription,
    getTransactionById,
    createTransaction,
    updateTransaction ,
    deleteTransaction
}