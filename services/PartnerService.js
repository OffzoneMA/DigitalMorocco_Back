const Partner = require("../models/Partner");
const uploadService = require('./FileService')

const getAllPartners = async (args) => {
    const page = args.page || 1;
    const pageSize = args.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const countries = args.countries ? args.countries.split(',') : [];
    const sectors = args.sectors ? args.sectors.split(',') : [];
    const stages = args.stages ? args.stages.split(',') : [];

    const query = {};
    query.companyName = { $exists: true }
    query.visbility = 'public'
    if (countries.length > 0) query.country = { $in: countries };
    if (sectors.length > 0) query.sector = { $in: sectors };
    if (stages.length > 0) query.stage = { $in: stages };

    const totalCount = await Partner.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);
    const partners = await Partner.find(query)
        .select("_id companyName website logo desc")
        .skip(skip)
        .limit(pageSize);
    return { partners, totalPages }


}

const createEnterprise = async (partnerId, infos, documents, logo) => {
    try {
        let legalDocs = []
        const partner = await getPartnerById(partnerId)
        let entreprise = {
            companyName: infos.companyName,
            legalName: infos.legalName,
            website: infos.website,
            contactEmail: infos.contactEmail,
            address: infos.address,
            desc: infos.desc,
            country: infos.country,
            city: infos.city,
            state: infos?.state,
            companyType: infos.companyType,
            taxNbr: infos.tin,
            corporateNbr: infos.cin,
            listEmployee: infos.listEmployees,
            visbility: infos.visbility,
        }


        if (documents) {
            for (const doc of documents) {
                let fileLink = await uploadService.uploadFile(doc, "Partners/" + partner.owner + "/documents", doc.originalname)
                legalDocs.push({ name: doc.originalname, link: fileLink, type: doc.mimetype })
            }
            entreprise.legalDocument = legalDocs
        }
        if (logo) {
            let logoLink = await uploadService.uploadFile(logo[0], "Partners/" + partner.owner + "", 'logo')
            entreprise.logo = logoLink
        }
        return await Partner.findByIdAndUpdate(partnerId, entreprise);
    }
    catch (err) {
        throw new Error('Something went wrong !')
    }
}


const CreatePartner = async (partner) => {
    return await Partner.create(partner);
}

const getPartnerByUserId = async (userId) => {
    return await Partner.findOne({ owner: userId });
}

const getPartnerById = async (id) => {
    return await Partner.findById(id);
}

const partnerByNameExists = async (name) => {
    return await Partner.exists({ name: name })
}



module.exports = { CreatePartner, getPartnerById, partnerByNameExists, createEnterprise, getAllPartners, getPartnerByUserId }