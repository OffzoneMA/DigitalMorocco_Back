const Investor = require("../models/Investor");
const User = require("../models/User");



const getAllInvestors = async (args) => {
    const page = args.page || 1;
    const pageSize = args.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // const countries = args.countries ? args.countries.split(',') : [];
    // const sectors = args.sectors ? args.sectors.split(',') : [];
    // const stages = args.stages ? args.stages.split(',') : [];

    // const query = {};
    // query.companyName = { $exists: true }
    // query.visbility = 'public'
    // if (countries.length > 0) query.country = { $in: countries };
    // if (sectors.length > 0) query.sector = { $in: sectors };
    // if (stages.length > 0) query.stage = { $in: stages };

    const totalCount = await Investor.countDocuments();
    const totalPages = Math.ceil(totalCount / pageSize);
    const investors = await Investor.find()
        .populate({ path: 'owner', select: 'displayName', match: { displayName: { $exists: true } }, })
        .skip(skip)
        .limit(pageSize);
    return { investors, totalPages }


}


const CreateInvestor = async (investor) => {
    return await Investor.create(investor);
}

const getInvestorById = async (id) => {
    return await Investor.findById(id);
}

const investorByNameExists = async (name) => {
    return await Investor.exists({ name: name })
}




module.exports = { CreateInvestor, getInvestorById, investorByNameExists, getAllInvestors }