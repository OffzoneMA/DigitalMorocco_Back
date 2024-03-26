const Member = require("../models/Member");
const SubscriptionLogs = require("../models/SubscriptionLogs");
const Investor = require("../models/Investor");
const Project = require("../models/Project");
const SubscriptionService = require("../services/SubscriptionService");
const SubscriptionLogService = require("../services/SubscriptionLogService");
const uploadService = require('./FileService')
const MemberReq = require("../models/Requests/Member");

const getAllMembers = async (args) => {
  try {
    const page = args.page || 1;
    const pageSize = args.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const query = {
      companyName: { $exists: true },
      visbility: 'public',
    };

    if (args.countries && args.countries.length > 0) {
      query.country = { $in: args.countries.split(',') };
    }

    if (args.sectors && args.sectors.length > 0) {
      query.companyType = { $in: args.sectors.split(',') };
    }

    if (args.stages && args.stages.length > 0) {
      query.stage = { $in: args.stages.split(',') };
    }

    const totalCount = await Member.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);
    const members = await Member.find(query)
      .select('_id companyName website logo desc companyType')
      .skip(skip)
      .limit(pageSize);

    return { members, totalPages };
  } catch (error) {
    console.error('Error fetching members:', error);
    throw new Error('Something went wrong');
  }
};

async function getTestAllMembers() {
    return await Member.find();
}

const CreateMember = async (userId, member) => {
    return await Member.create({ ...member, owner: userId });
};

const createEnterprise = async (memberId, infos, documents, logo) => {
    try {
        let legalDocs = []
        const member = await getMemberById(memberId)
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
            stage: infos.stage,
            taxNbr: infos.tin,
            corporateNbr: infos.cin,
            listEmployee: infos.listEmployees,
            visbility: infos.visbility,
        }


        if (documents) {
            for (const doc of documents) {
                let fileLink = await uploadService.uploadFile(doc, "Members/" + member.owner + "/documents", doc.originalname)
                legalDocs.push({ name: doc.originalname, link: fileLink, type: doc.mimetype })
            }
            entreprise.legalDocument = legalDocs
        }
        if(logo){
        let logoLink = await uploadService.uploadFile(logo[0], "Members/" + member.owner + "", 'logo')
            entreprise.logo = logoLink
        }
        return await Member.findByIdAndUpdate(memberId, entreprise);
    }
    catch (err) {
        throw new Error('Something went wrong !')
    }
}

const createCompany = async (memberId, companyData, logoFile) => {
    try {
        const member = await getMemberById(memberId);

        let updatedCompanyData = { ...companyData };

        if (logoFile) {
            const logoURL = await uploadService.uploadFile(logoFile, 'Members/', + member.owner + "", 'logo');
            updatedCompanyData.logo = logoURL;
            console.log(logoURL)
        }

        const updatedMember = await Member.findByIdAndUpdate(memberId, updatedCompanyData);

        return updatedMember;
    } catch (error) {
        console.log(error);
        throw new Error('Error creating company', error);
    }
};

const createEmployee = async (memberId, employeeData , photo)=> {
    try {
        const member = await getMemberById(memberId)
        if (!member) {
            throw new Error('Member not found');
        }
        if (photo) {
            const logoURL = await uploadService.uploadFile(photo, 'Members/', + member.owner + "/employees", photo.originalname);
            employeeData.image = logoURL;
        }
        member.listEmployee.push(employeeData);
        const savedEmployee = await member.save();
        return savedEmployee.listEmployee[savedEmployee.listEmployee.length - 1];
    } catch (error) {
        console.log(error);
        throw new Error('Error creating employee' , error);
    }
}

const createLegalDocument = async (memberId, documentData , docFile)=> {
    try {
        const member = await getMemberById(memberId)
        if (!member) {
            throw new Error('Member not found');
        }
        if (docFile) {
            const docURL = await uploadService.uploadFile(docFile, 'Members/', + member.owner + "/documents", docFile.originalname);
            documentData.link = docURL;
            documentData.type = docFile.mimetype;
            documentData.name = docFile.originalname;
        }
        member.legalDocument.push(documentData);
        const savedDocument = await member.save();
        return savedDocument.legalDocument[savedDocument.legalDocument.length - 1];
    } catch (error) {
        throw new Error('Error creating legal document');
    }
}

const createProject = async (memberId, infos, documents) => {
    const member = await Member.findById(memberId);
    if (!member) {
        throw new Error('Member doesn\'t exist!');
    }

    // Check if the project already exists
    let project = await Project.findOne({ owner: memberId });

    if (!project) {
        // If project doesn't exist, create a new one
        project = new Project({
            owner: memberId,
            name: infos.name,
            funding: infos.fundingAmount,
            currency: infos.currency,
            details: infos.details,
            milestoneProgress: infos.milestoneProgress,
            listMember: infos.listMembers,
            visbility: infos.visbility,
        });

        // Save the project
        await project.save();
    } else {
        // If project exists, update its fields
        project.name = infos.name;
        project.funding = infos.fundingAmount;
        project.currency = infos.currency;
        project.details = infos.details;
        project.milestoneProgress = infos.milestoneProgress;
        project.listMember = infos.listMembers;
        project.visbility = infos.visbility;

        // Check if there are documents to update
        if (documents?.files) {
            let Docs = [];
            for (const doc of documents.files) {
                let fileLink = await uploadService.uploadFile(doc, "Members/" + member.owner + "/Project_documents", doc.originalname);
                Docs.push({ name: doc.originalname, link: fileLink, type: doc.mimetype });
            }
            project.documents = Docs;
        }

        // Save the updated project
        await project.save();
    }

    return project;
};

async function createTestProject(ownerId, projectData , documentsFiles) {
    try {
      const member = await Member.findById(ownerId);
      if (!member) {
        throw new Error("Member not found");
    }
      const project = new Project({ owner: ownerId, ...projectData });

      if (documentsFiles) {
        let Docs = [];
        for (const doc of documentsFiles) {
            let fileLink = await uploadService.uploadFile(doc, "Members/" + member.owner + "/Project_documents", doc.originalname);
            Docs.push({ name: doc.originalname, link: fileLink, type: doc.mimetype });
        }
        project.documents = Docs;
    }
      const savedProject = await project.save();
      return savedProject;
    } catch (error) {
      throw error;
    }
  }

const deleteMember = async (userId) => {
    const member = await getMemberByUserId(userId)
    if (Member) {
        //Contacts
        await ContactRequest.deleteMany({ member: member._id })
        await Investor.updateMany(
            { $pull: { membersRequestsAccepted: member._id }, $pull: { membersRequestsPending: member._id } })
       
        //Subscriptions
        await SubscriptionLogs.deleteMany({ member: member._id })

        //Project
        await ProjectSchema.deleteMany({ owner: member._id })

        await Member.findByIdAndDelete(member._id)
    }
    else {
        await MemberReq.findOneAndDelete({ user: userId })
    }
    await uploadService.deleteFolder('Members/' + userId +"/documents")
    await uploadService.deleteFolder('Members/' + userId + "/Project_documents")
    await uploadService.deleteFolder('Members/' + userId)

}


const getMemberById = async (id) => {
    return await Member.findById(id);
}
const getMemberByUserId = async (userId) => {
    return await Member.findOne({ owner: userId });
}

const getMemberByName = async (name) => {
    return await Member.find({ name: name })
}


const memberByNameExists = async (name) => {
    return await Member.exists({ name: name })
}

const SubscribeMember = async (memberId, subid) => {
    const subscription = await SubscriptionService.getSubscriptionById(subid)
    if (!subscription) {
        throw new Error('Subscription doesn t exist !')
    }


    //Payement Logic ...(Stripe ...)


    const member = await getMemberById(memberId)
    if (member?.subStatus == "active") {
        return await RenewSubscription(member, subscription)
    }
    else {
        //Expire Date calculation
        const expiry_date = new Date();
        expiry_date.setDate(expiry_date.getDate() + subscription?.duration);

        await SubscriptionLogService.createSubscriptionLog({
            subscriptionId: subscription._id,
            member: memberId,
            credits: subscription.credits,
            totalCredits: subscription.credits + (member?.credits || 0),
            subscriptionExpireDate: expiry_date
        })
        return await Member.findByIdAndUpdate(memberId, {
            subscriptionId: subscription._id,
            subStatus: "active",
            expireDate: expiry_date,
            $inc: { 'credits': subscription.credits }
        })
    }

}


const RenewSubscription = async (member, subscription) => {

    //Expire Date calculation
    const expiry_date = new Date(member.expireDate);
    expiry_date.setDate(expiry_date.getDate() + subscription?.duration);

    await SubscriptionLogService.createSubscriptionLog({
        subscriptionId: subscription._id,
        member: member?._id,
        credits: subscription.credits,
        totalCredits: subscription.credits + (member?.credits || 0),
        subscriptionExpireDate: expiry_date,
        type: 'Renew'
    })

    return await Member.findByIdAndUpdate(member?._id, {
        subscriptionId: subscription._id,
        subStatus: "active",
        expireDate: expiry_date,
        $inc: { 'credits': subscription.credits }
    })
}


const checkSubscriptionStatus = async () => {
    try {
        const current_date = new Date();

        const activeSubscribers = await Member.find({ subStatus: 'active' });

        for (const Member of activeSubscribers) {
            if (Member.expireDate < current_date) {
                await Member.findByIdAndUpdate(Member._id, {
                    subscriptionId: null,
                    expireDate: null,
                    subStatus: 'notActive'

                });
            }
        }
    } catch (err) {
        console.error('Error checking subscription status:', err);
    }
};


const checkMemberSubscription = async (memberId) => {
    try {
        const current_date = new Date();

        const member = await Member.findById(memberId);

        if (member && member?.expireDate < current_date) {
            await Member.findByIdAndUpdate(memberId, {
                subscriptionId: null,
                expireDate: null,
                subStatus: 'notActive'

            });
        }

    } catch (err) {
        console.error('Error checking subscription status:');
    }
};


const getContacts = async (memberId) => {
    const investors = await Member.findById(memberId).select("investorsRequestsAccepted").populate({
        path: 'investorsRequestsAccepted', select: '_id  name linkedin_link'
    });
    return investors.investorsRequestsAccepted
}



module.exports = { deleteMember,getContacts,getAllMembers,createProject, checkSubscriptionStatus, 
    CreateMember, createEnterprise, getMemberById, memberByNameExists, getMemberByName, 
    SubscribeMember, getMemberByUserId, checkMemberSubscription, checkSubscriptionStatus ,
    createCompany , createEmployee, createLegalDocument , getTestAllMembers , createTestProject} 