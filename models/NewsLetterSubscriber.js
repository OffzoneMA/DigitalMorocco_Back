// models/subscriber.js

const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  subscribed: {
    type: Boolean,
    default: true 
  },
  subscriptionDate: {
    type: Date,
    default: Date.now
  },
  unsubscriptionDate: {
    type: Date
  }
});

const NewsLetterSubscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = NewsLetterSubscriber;
