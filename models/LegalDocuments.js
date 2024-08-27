const mongoose = require("mongoose");

const LegalDocumentSchema = new mongoose.Schema({
  name: String,
  link: String,
  description: String,
  date: { type: Date, default: Date.now },
  type: String,
  lastModifiedDate: Date,
  title: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  dateCreated: { type: Date, default: Date.now },
});

const LegalDocument = mongoose.model("LegalDocument", LegalDocumentSchema);
module.exports = LegalDocument;
