const Partner = require("../models/Partner");
const uploadService = require('./FileService');
const Project = require("../models/Project");
const PartnerReq = require("../models/Requests/Partner");

const getAllPartners = async (args) => {
    const page = args.page || 1;
    const pageSize = args.pageSize || 15;
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

const getAllPartnersAll = async () => {
    const totalCount = await Partner.countDocuments();
    const partners = await Partner.find();
    return { partners, totalCount }
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
const getProjects = async () => {

    const projects = await Project.find({ visbility : 'public' })
                        .populate({
                            path: 'owner',
                            select: '_id country companyType owner logo companyName contactEmail city website', // Select the fields you want from the member (enterprise)
                        })
                        .select('_id name funding currency details milestoneProgress documents');
    return projects;
}

async function updatePartner(id, data) {
    return Partner.findByIdAndUpdate(id, data, { new: true });
  }

const deletePartner = async (userId) => {
    const partner = await getPartnerByUserId(userId)
    if (partner) {
          return await Partner.findByIdAndDelete(partner._id)
    }
    else {
        await PartnerReq.findOneAndDelete({ user: userId })
    }
    await uploadService.deleteFolder('Partners/' + userId + "/documents")
     await uploadService.deleteFolder('Partners/' + userId)
     return true

}

const searchPartners = async (searchTerm) => {
    try {
        const regex = new RegExp(searchTerm, 'i'); 
        
        const partners = await Partner.find({
            $or: [
                // { desc: regex },
                // { contactEmail: regex },
                { companyName: regex },
                // { country: regex } , 
                // {address : regex } , 
                // {companyType : regex}
            ]
        });

        return partners ;
    } catch (error) {
        throw new Error('Error searching partners: ' + error.message);
    }
};


module.exports = { deletePartner,CreatePartner, getPartnerById, partnerByNameExists, 
    createEnterprise, getAllPartners,getProjects, getPartnerByUserId , updatePartner , 
    getAllPartnersAll , searchPartners}