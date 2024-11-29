const Billing = require('../models/Billing');
const uploadService = require('./FileService');


const createBillingForUser = async (userId, data, docFile) => {
  try {
    const billing = new Billing({
      userId,
      amount: data?.amount,
      dueDate: data?.dueDate,
      status: data?.status,
    });

    if (docFile) {
      const docURL = await uploadService.uploadFile(
        docFile,
        `Billing/${userId}/uploadBy/${userId}`,
        docFile.originalname
      );

      billing.document = {
        link: docURL,
        mimeType: docFile.mimetype,
        name: docFile.originalname,
      };
    }

    const savedBilling = await billing.save();
    return savedBilling; 
  } catch (error) {
    throw new Error(`Error creating billing for user: ${error.message}`);
  }
};


const getBillingByUserId = async (userId) => {
  return await Billing.find({ userId });
};

const updateBillingStatus = async (billingId, status) => {
    return await Billing.findByIdAndUpdate(billingId, { status }, { new: true });
};

const getAllBillingsForUser = async (userId) => {
    try {
      return await Billing.find({ userId });
    } catch (error) {
        console.log(error)
      throw new Error(`Error retrieving billings for user: ${error.message}`);
    }
  };
  
const deleteBillingById = async (billingId) => {
    try {
        return await Billing.findByIdAndDelete(billingId);
    } catch (error) {
        throw new Error(`Error deleting billing: ${error.message}`);
    }
};

module.exports = {
    createBillingForUser,
    getBillingByUserId,
    updateBillingStatus, getAllBillingsForUser,
    deleteBillingById,
};
