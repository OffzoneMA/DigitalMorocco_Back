const Partner = require("../models/Partner");

const CreatePartner = async (partner) => {
    return await Partner.create(partner);
}

const getPartnerById = async (id) => {
    return await Partner.findById(id);
}

const partnerByNameExists = async (name) => {
    return await Partner.exists({ name: name })
}



module.exports = { CreatePartner, getPartnerById, partnerByNameExists }