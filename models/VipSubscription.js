// models/VipServiceSubscription.js

const mongoose = require('mongoose');

const VipSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    enum: ['VIP_NEWSLETTER', 'VIP_CLUB'],
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: Date,
  nextBillingDate: {
    type: Date,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'FAILED'],
    default: 'PAID'
  },
});

module.exports = mongoose.model('VipSubscription', VipSubscriptionSchema);
