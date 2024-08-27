const Document = require("../models/Document");
const User = require("../models/User");
const MemberService = require("../services/MemberService");
const UserService = require("../services/UserService");
const uploadService = require('./FileService')
const ActivityHistoryService = require('../services/ActivityHistoryService');

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
        await ActivityHistoryService.createActivityHistory(
            user._id,
            'document_created',
            { targetName: document.documentName, targetDesc: `Document created with ID ${document._id}` }
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
        await ActivityHistoryService.createActivityHistory(
            document.owner,
            'document_updated',
            { targetName: document.documentName, targetDesc: `Document updated with ID ${document._id}` }
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

        const existingUsers = await User.find({ _id: { $in: userIds } });
        if (existingUsers.length !== userIds.length) {
            throw new Error('One or more users not found');
        }

        document.shareWith = shareWithType;
        document.shareWithUsers = userIds;

        await document.save();
        await ActivityHistoryService.createActivityHistory(
            document.owner,
            'document_shared',
            { targetName: document.documentName, targetDesc: `Document shared with users: ${userIds.join(', ')}` , to: shareWithType}
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

async function getDocumentsForUser(userId) {
    try {
        const documents = await Document.find({ owner: userId }).populate('owner');
        return documents;
    } catch (error) {
        throw new Error('Error getting documents for member: ' + error.message);
    }
}

async function getDocumentsByUploader(userId) {
    try {
        const documents = await Document.find({ uploadBy: userId });
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

        await ActivityHistoryService.createActivityHistory(
            document.owner,
            'document_deleted',
            { targetName: document.documentName, targetDesc: `Document deleted with ID ${documentId}` }
        );

        return document;
    } catch (error) {
        throw new Error('Error deleting document: ' + error.message);
    }
}




module.exports = {createDocument , updateDocument , getAllDocuments, getDocumentById,
getDocumentsForUser , getDocumentsByUploader, deleteDocument , shareDocument}
