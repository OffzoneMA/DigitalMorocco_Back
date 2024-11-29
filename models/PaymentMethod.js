const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paymentMethodType: 
    {   type: String, 
        default: 'Card' 
    },
  paymentMethod: { type: String, required: true },
  stripePaymentMethodId: String,
  cardName: String,
  cardNumber: String,
  expiryDate: String,
  expiryMonth: String,
  expiryYear: String, 
  cvv: String,
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

module.exports = PaymentMethod;
