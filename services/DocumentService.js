const Document = require("../models/Document");
const User = require("../models/User");
const MemberService = require("../services/MemberService");
const UserService = require("../services/UserService");
const uploadService = require('./FileService')
const ActivityHistoryService = require('../services/ActivityHistoryService');
const EmployeeService = require('../services/EmployeeService');
const Employee = require('../models/Employees');
const Investor = require('../models/Investor');

async function createDocument(userId , documentData, docFile) {
    try {
        const user = await UserService.getUserByID(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (docFile) {
            const docURL = await uploadService.uploadFile(docFile, 'Documents/'+ user._id +"/uploadBy/" +user._id, docFile.originalname);
            documentData.link = docURL;
            documentData.docType = docFile.mimetype;
            documentData.documentName = docFile.originalname;
        }
        const document = new Document(documentData);
        document.owner = user._id;
      
        await document.save();
        const extension = document.documentName?.split('.')?.pop();
        await ActivityHistoryService.createActivityHistory(
            user._id,
            'document_created',
            { targetName: `${document?.title}.${extension}`, targetDesc: `Document created with ID ${document._id}` }
        );
        return document;
    } catch (error) {
        throw new Error('Error creating document: ' + error.message);
    }
}

async function updateDocument(documentId, updateData, docFile ) {
    try {
        const document = await Document.findById(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        if (docFile) {
            await uploadService.deleteFile(document.documentName , 'Documents/'+ document.owner +"/uploadBy/" + document.owner)
            const docURL = await uploadService.uploadFile(docFile, 'Documents/'+ document.owner +"/uploadBy/" + document.owner, docFile.originalname);
            updateData.link = docURL;
            updateData.docType = docFile.mimetype;
            updateData.documentName = docFile.originalname;
        }

        Object.assign(document, updateData); 
        await document.save();
        const extension = document.documentName?.split('.')?.pop();
        await ActivityHistoryService.createActivityHistory(
            document.owner,
            'document_updated',
            { targetName: `${document?.title}.${extension}`, targetDesc: `Document updated with ID ${document._id}` }
        );
        return document;
    } catch (error) {
        throw new Error('Error updating document: ' + error.message);
    }
}

async function shareDocument(documentId, userIds , shareWithType) {
    try {
        const document = await Document.findById(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        const existingEmployees = await Employee.find({ _id: { $in: userIds } });
        const existingInvestors = await Investor.find({ _id: { $in: userIds } });

        // Combine employee and investor IDs
        const foundUserIds = [
        ...existingEmployees.map(employee => employee._id.toString()),
        ...existingInvestors.map(investor => investor._id.toString()),
        ];

        if (foundUserIds.length !== userIds.length) {
        throw new Error('One or more employees or investors not found');
        }

        document.shareWith = shareWithType;
        document.shareWithUsers = userIds;

        await document.save();
        const extension = document?.documentName?.split('.')?.pop();
        await ActivityHistoryService.createActivityHistory(
            document.owner,
            'document_shared',
            { targetName: `${document?.title}.${extension}`, targetDesc: `Document shared with users: ${userIds.join(', ')}` , to: shareWithType}
        );
        return document;
    } catch (error) {
        throw new Error('Error sharing document: ' + error.message);
    }
}
async function getAllDocuments() {
    try {
        const documents = await Document.find().populate('owner');
        return documents;
    } catch (error) {
        throw new Error('Error getting all documents: ' + error.message);
    }
}

async function getDocumentById(documentId) {
    try {
        const document = await Document.findById(documentId);
        if (!document) {
            throw new Error('Document not found');
        }
        return document;
    } catch (error) {
        throw new Error('Error getting document by ID: ' + error.message);
    }
}

async function getDocumentsForUser(userId, args) {
    try {
        const page = args?.page || 1; 
        const pageSize = args?.pageSize || 8; 
        const skip = (page - 1) * pageSize; 

        const documents = await Document.find({ owner: userId })
            .populate('owner')
            .skip(skip) 
            .sort({ uploadDate: 'desc' })
            .limit(pageSize); 

        // Compter le total de documents pour le calcul des pages
        const totalCount = await Document.countDocuments({ owner: userId });
        const totalPages = Math.ceil(totalCount / pageSize); 

        return { documents, totalPages }; 
    } catch (error) {
        throw new Error('Error getting documents for member: ' + error.message);
    }
}


async function searchDocuments(user, searchTerm) {
    try {
        const userRole = user?.role?.toLowerCase();
        const regex = new RegExp(searchTerm, 'i'); 
        let query;

        if (userRole === 'admin') {
            query = { $or: [{ title: regex }, 
                // { documentName: regex }
            ] }; 
        } else {
            query = {
                owner: user?._id,
                $or: [{ title: regex },
                    //  { documentName: regex }
                    ] 
            };
        }

        const documents = await Document.find(query).populate('owner');
        return documents;
    } catch (error) {
        throw new Error('Error searching documents for member: ' + error.message);
    }
}


async function getDocumentsByUploader(userId) {
    try {
        const documents = await Document.find({ uploadBy: userId }).sort({ uploadDate: 'desc' });
        return documents;
    } catch (error) {
        throw new Error('Error getting documents by uploader: ' + error.message);
    }
}

async function deleteDocument(documentId) {
    try {
        const document = await Document.findByIdAndDelete(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        await uploadService.deleteFile(document.documentName, 'Documents/' + document.owner + "/uploadBy/" + document.owner);
        const extension = document?.documentName?.split('.')?.pop();
        await ActivityHistoryService.createActivityHistory(
            document.owner,
            'document_deleted',
            { targetName: `${document?.title}.${extension}`, targetDesc: `Document deleted with ID ${documentId}` }
        );

        return document;
    } catch (error) {
        throw new Error('Error deleting document: ' + error.message);
    }
}

async function getShareWithData(userId) {
    try {
        const user = await UserService.getUserByID(userId);
        if (!user) {
            throw new Error('User not found');
        }
        let employees = [];
        let investors = [];

        employees = await EmployeeService.getAllEmployeesByUserWithoutPagination(userId);

        if (user.role?.toLocaleLowerCase() === 'member') {
            const member = await MemberService.getMemberByUserId(userId);
            investors = await MemberService.getInvestorsForMemberWithoutPagination(member?._id);
        }

        const result = [
            ...employees.map(employee => ({
              _id: employee._id,
              type: 'Employee',
              name: employee.fullName,
              email: employee.workEmail,
              phoneNumber: employee.phoneNumber,
              image: employee.image,
            })),
            ...investors.map(investor => ({
              _id: investor._id,
              type: 'Investor',
              name: investor.name,
              email: investor.contactEmail,
              phoneNumber: investor.phoneNumber,
              image: investor.image,
            })),
        ];
        return result;
    } catch (error) {
        throw new Error('Error fetching shared data');
    }
}


module.exports = {createDocument , updateDocument , getAllDocuments, getDocumentById,
getDocumentsForUser , getDocumentsByUploader, deleteDocument , shareDocument , 
getShareWithData  , searchDocuments}
