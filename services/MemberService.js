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

const getAllEmployees = async (args) => {
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
        console.error('Error fetching employees:', error);
        throw new Error('Something went wrong');
    }
};

const addEmployeeToMember = async (userId, newEmployeeData) => {
    try {
        const member = await Member.findOne({ owner: userId });
        if (!member) {
            throw new Error('Membre non trouvé');
        }

        member.listEmployee.push({
            ...newEmployeeData,
        });

        await member.save();

        return {
            message: 'Nouvel employé ajouté avec succès',
            employee: newEmployeeData,
        };
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'employé :', error);
        throw new Error('Quelque chose s\'est mal passé');
    }
};

const createCompany = async (userId, companyData) => {
    try {
        const existingMember = await Member.findOne({ owner: userId });
        if (existingMember) {
            existingMember.companyName = companyData.companyName;
            existingMember.legalName = companyData.legalName;
            existingMember.website = companyData.website;
            existingMember.contactEmail = companyData.contactEmail;
            existingMember.desc = companyData.desc;
            existingMember.country = companyData.country;
            existingMember.city = companyData.city.name;
            existingMember.companyType = companyData.companyType.join(", ");
            existingMember.taxNbr = companyData.taxIdentfier;
            existingMember.corporateNbr = companyData.corporateNbr;
            existingMember.logo = companyData.logo;

            const savedMember = await existingMember.save();

            return {
                message: 'Nouvelle entreprise ajoutée avec succès',
                company: savedMember,
            };
        }
        throw new Error("Le membre n'existe pas pour cet utilisateur");
    } catch (error) {
        throw new Error("Impossible de créer l'entreprise : " + error.message);
    }
};

const addLegalDocumentToMember = async (memberId, documentData) => {
    try {
      const member = await Member.findOne({ owner: memberId });
      if (!member) {
        throw new Error("Member not found");
      }
        const uniqueFileName = `${Date.now()}-${documentData.name}`;
      const newDocument = {
        name: uniqueFileName,
        date: Date.now(),
        type: documentData.type,
        lastModifiedDate: documentData.lastModifiedDate,
        title: documentData.title,
        data:documentData.data,
      };
      member.legalDocument.push(newDocument);
      await member.save();
      return member;
    } catch (error) {
      throw error;
    }
};

const deleteLegalDocument = async (documentId) => {
    try {
        const deletedDocument = await Member.findOneAndUpdate(
          { 'legalDocument._id': documentId },
          { $pull: { legalDocument: { _id: documentId } } },
          { new: true }
        );
    
        if (!deletedDocument) {
          throw new Error("Document not found");
        }
    
        return deletedDocument;
      } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
      }
};

const editLegalDocument = async (documentId,userId, updatedDocumentData) => {
    try {
       
        const member = await Member.findOne({ owner: userId });
        if (!member) {
            throw new Error("Membre non trouvé");
        }

        const documentIndex = member.legalDocument.find(doc => doc._id.toString() === documentId);
        console.log(documentIndex)
       

        if (documentIndex === -1) {
            throw new Error("document legal non trouvé dans ce membre");
        }

        documentIndex.title = updatedDocumentData.title;
        documentIndex.data = updatedDocumentData.data;
        documentIndex.name = updatedDocumentData.name;
        documentIndex.lastModifiedDate = new Date();
        documentIndex.type = updatedDocumentData.type;

        await member.save();
        
    } catch (error) {
        console.error("Erreur lors de la mise à jour du document :", error);
        throw new Error("Erreur lors de la mise à jour du document ");
    }
}

const updateEmployeeToMember = async (memberId, employeeId, updatedEmployeeData) => {
    try {
        const member = await Member.findOne({ owner: memberId });
        if (!member) {
            throw new Error("Membre non trouvé");
        }

        const employeeIndex = member.listEmployee.find(emp => emp._id.toString()  === employeeId);
        console.log(employeeIndex)
        if (employeeIndex === -1) {
            throw new Error("Employé non trouvé dans ce membre");
        }
        const base64Data = updatedEmployeeData.photo.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

        employeeIndex.firstName=updatedEmployeeData.firstName;
        employeeIndex.lastName=updatedEmployeeData.lastName;
        employeeIndex.email=updatedEmployeeData.email;
        employeeIndex.jobTitle=updatedEmployeeData.jobTitle;
        employeeIndex.level=updatedEmployeeData.level;
        employeeIndex.status=updatedEmployeeData.status;
        employeeIndex.address=updatedEmployeeData.address;
        employeeIndex.country=updatedEmployeeData.country;
        employeeIndex.cityState=updatedEmployeeData.cityState;
        employeeIndex.phoneNumber=updatedEmployeeData.phoneNumber;
        employeeIndex.startDate=updatedEmployeeData.startDate;
        employeeIndex.personalTaxIdentifierNumber=updatedEmployeeData.personalTaxIdentifierNumber;
        employeeIndex.photo=buffer;
        employeeIndex.department=updatedEmployeeData.department;

        await member.save();

        return member.listEmployee[employeeIndex];
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'employé :", error);
        throw new Error("Erreur lors de la mise à jour de l'employé");
    }
}

const CreateMember = async (member) => {
    return await Member.create(member);
}

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
        if (logo) {
            let logoLink = await uploadService.uploadFile(logo[0], "Members/" + member.owner + "", 'logo')
            entreprise.logo = logoLink
        }
        return await Member.findByIdAndUpdate(memberId, entreprise);
    }
    catch (err) {
        throw new Error('Something went wrong !')
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
    await uploadService.deleteFolder('Members/' + userId + "/documents")
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

const checkMemberStatus = async (memberId) => {
    try{
        const member = await Member.findOne({ owner: memberId, subStatus: 'active' });
        if (!member) {
        return false;
        }
        const subscriptionLog = await SubscriptionLogs.findOne({ member: member._id });
        if (!subscriptionLog) {
            return false;
        }
        const currentDate = new Date();
        const expirationDate = new Date(subscriptionLog.subscriptionExpireDate); 
        console.log("currentDate",currentDate)
        console.log("expirationDate",expirationDate)
        if (currentDate > expirationDate) {
        return false;
        }

        return true;
    } catch (error) {
    console.error('Error checking member status:', error);
    return false;
    }

  };


module.exports = {checkMemberStatus,editLegalDocument,deleteLegalDocument, addLegalDocumentToMember, createCompany, updateEmployeeToMember, addEmployeeToMember, getAllEmployees, deleteMember, getContacts, getAllMembers, createProject, checkSubscriptionStatus, CreateMember, createEnterprise, getMemberById, memberByNameExists, getMemberByName, SubscribeMember, getMemberByUserId, checkMemberSubscription, checkSubscriptionStatus }