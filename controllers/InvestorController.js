const InvestorService = require('../services/InvestorService');


const getInvestors = async (req, res) => {
    try {
        const result = await InvestorService.getAllInvestors(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addInvestor = async (req, res) => {
    try {
        const result = await InvestorService.CreateInvestor(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};






module.exports = { addInvestor, getInvestors }