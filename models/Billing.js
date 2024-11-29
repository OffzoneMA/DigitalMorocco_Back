const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['upcoming', 'paid', 'to be paid'], default: 'upcoming' },
  amount: { type: Number, required: true },
  dateCreated: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  document: {
    name: String,
    link: String,
    mimeType: String,
}, 
});

module.exports = mongoose.model('Billing', BillingSchema);
