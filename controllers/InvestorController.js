const InvestorService = require('../services/InvestorService');

const addInvestor = async (req, res) => {
    try {
        const result = await InvestorService.CreateInvestor(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};






module.exports = { addInvestor }