const contactRequestService = require('../services/InvestorContactService');

const getAllContactRequests = async (req, res) => {
    try {
        const result = await contactRequestService.getAllContactRequestsAll();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getContactRequestById = async (req, res) => {
    try {
        const contactRequest = await contactRequestService.getContactRequestById(req.params.id);
        res.status(200).json(contactRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createContactRequest = async (req, res) => {
    try {
        const contactRequest = await contactRequestService.createContactRequest(req.body);
        res.status(201).json(contactRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateContactRequest = async (req, res) => {
    try {
        const contactRequest = await contactRequestService.updateContactRequest(req.params.id, req.body);
        res.status(200).json(contactRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteContactRequest = async (req, res) => {
    try {
        await contactRequestService.deleteContactRequest(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllContactRequests,
    getContactRequestById,
    createContactRequest,
    updateContactRequest,
    deleteContactRequest
};
