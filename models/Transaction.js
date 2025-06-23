const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    internalId: {
        type: String,
    },
    type: {
        type: String,
    },
    amount: {
        type: Number,
    },
    currency: {
        type: String,
    },
    status: {
        type: String,
    },
    paymentType: {
        type: String,
    },
    paymentMethod: {
        type: String,
    },
    state: {
        type: String,
    },
    responseText: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
});
const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;