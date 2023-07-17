const PartnerService = require('../services/PartnerService');

const addPartner = async (req, res) => {
    try {
        const result = await PartnerService.CreatePartner(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};






module.exports = { addPartner }