const mongoose = require('mongoose');

const investorAccessLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accessDate: { type: Date, required: true },
  creditsDeducted: { type: Boolean, default: false },
}, { timestamps: true });

// Un seul accès par utilisateur et par jour
investorAccessLogSchema.index(
  { user: 1, accessDate: 1 },
  {
    unique: true,
    partialFilterExpression: { accessDate: { $exists: true } }
  }
);

module.exports = mongoose.model('InvestorAccessLog', investorAccessLogSchema);