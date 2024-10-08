// controllers/billingController.js
const billingService = require('../services/BillingService');

const createBilling = async (req, res) => {
    try {
        const { userId } = req.params;
        const billing = await billingService.createBillingForUser(userId, req.body, req.file);
        res.status(201).json(billing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBillingByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const billingRecords = await billingService.getBillingByUserId(userId);
        res.status(200).json(billingRecords);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateBillingStatus = async (req, res) => {
    try {
        const { billingId } = req.params;
        const { status } = req.body;
        const updatedBilling = await billingService.updateBillingStatus(billingId, status);
        res.status(200).json(updatedBilling);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBillingsForUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const billings = await billingService.getAllBillingsForUser(req.userId || userId);
      res.status(200).json(billings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
const deleteBilling = async (req, res) => {
    try {
        const { billingId } = req.params;
        const deletedBilling = await billingService.deleteBillingById(billingId);
        if (deletedBilling) {
        res.status(200).json({ message: 'Billing deleted successfully' });
        } else {
        res.status(404).json({ error: 'Billing not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
  

module.exports = {
    createBilling,
    getBillingByUser,
    updateBillingStatus, getBillingsForUser,
    deleteBilling
};
