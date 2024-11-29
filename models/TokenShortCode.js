const mongoose = require("mongoose");

const TokenShortCodeSchema = new mongoose.Schema({
    shortCode: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",    
    },
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '15m' 
    },
    used: { type: Boolean, default: false }
  });

const TokenShortCode = mongoose.model("TokenShortCode", TokenShortCodeSchema)
module.exports = TokenShortCode