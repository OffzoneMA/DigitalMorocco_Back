const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  fullName: String,
  workEmail: {
    type: String,
    required: true,
  },
  personalEmail: String,
  jobTitle: String,
  level: String,
  status: {
    type: String,
    default: 'Member',
  },
  address: String,
  country: String,
  cityState: String,
  phoneNumber: String,
  startDate: Date,
  image: String,
  personalTaxIdentifierNumber: String,
  department: String,
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
  lastModifiedDate: { type: Date },
});

const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;
