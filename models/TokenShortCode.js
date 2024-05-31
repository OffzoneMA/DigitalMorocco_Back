const mongoose = require("mongoose");

const TokenShortCodeSchema = new mongoose.Schema({
    shortCode: {
      type: String,
      required: true,
      unique: true
    },
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '30m' 
    }
  });

const TokenShortCode = mongoose.model("TokenShortCode", TokenShortCodeSchema)
module.exports = TokenShortCode