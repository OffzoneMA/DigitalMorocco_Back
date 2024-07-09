const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paymentMethod: { type: String, required: true },
  cardName: String,
  cardNumber: String,
  expiryDate: String,
  cvv: String,
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

module.exports = PaymentMethod;
