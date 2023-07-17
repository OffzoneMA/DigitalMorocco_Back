const Investor = require("../models/Investor");

const CreateInvestor = async (investor) => {
    return await Investor.create(investor);
}

const getInvestorById = async (id) => {
    return await Investor.findById(id);
}

const investorByNameExists = async (name) => {
    return await Investor.exists({ name: name })
}




module.exports = { CreateInvestor, getInvestorById, investorByNameExists }