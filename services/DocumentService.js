const Document = require("../models/Document");
const MemberService = require("../services/MemberService");
const UserService = require("../services/UserService");
const uploadService = require('./FileService')

async function createDocument(memberId , userId, documentData, docFile) {
    try {
        const member = await MemberService.getMemberById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        const user = await UserService.getUserByID(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (docFile) {
            const docURL = await uploadService.uploadFile(docFile, 'Documents/'+ member._id +"/uploadBy/" +user._id, docFile.originalname);
            documentData.link = docURL;
            documentData.docType = docFile.mimetype;
            documentData.documentName = docFile.originalname;
        }
        const document = new Document(documentData);
        document.owner = member._id;
        document.uploadBy = user._id;
        document.uploadDate = new Date();
        await document.save();
        return document;
    } catch (error) {
        throw new Error('Error creating document: ' + error.message);
    }
}

async function updateDocument(documentId, updateData, docFile) {
    try {
        const document = await Document.findById(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        if (docFile) {
            await uploadService.deleteFile(document.documentName , 'Documents/'+ document.owner +"/uploadBy/" + document.uploadBy)
            const docURL = await uploadService.uploadFile(docFile, 'Documents/'+ document.owner +"/uploadBy/" + document.uploadBy, docFile.originalname);
            updateData.link = docURL;
            updateData.docType = docFile.mimetype;
            updateData.documentName = docFile.originalname;
        }

        Object.assign(document, updateData); 
        await document.save();
        
        return document;
    } catch (error) {
        throw new Error('Error updating document: ' + error.message);
    }
}

async function shareDocument(documentId, userIds) {
    try {
        const document = await Document.findById(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        const existingUsers = await User.find({ _id: { $in: userIds } });
        if (existingUsers.length !== userIds.length) {
            throw new Error('One or more users not found');
        }

        // document.shareWith = userIds;

        await document.save();
        return document;
    } catch (error) {
        throw new Error('Error sharing document: ' + error.message);
    }
}


async function getAllDocuments() {
    try {
        const documents = await Document.find();
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

async function getDocumentsForMember(memberId) {
    try {
        const documents = await Document.find({ owner: memberId });
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
        await uploadService.deleteFile(document.documentName , 'Documents/'+ document.owner +"/uploadBy/" + document.uploadBy)
        return document;
    } catch (error) {
        throw new Error('Error deleting document: ' + error.message);
    }
}



module.exports = {createDocument , updateDocument , getAllDocuments, getDocumentById,
getDocumentsForMember , getDocumentsByUploader, deleteDocument}
