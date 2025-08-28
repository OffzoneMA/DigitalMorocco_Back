const Document = require("../models/Document");
const User = require("../models/User");
const MemberService = require("../services/MemberService");
const UserService = require("../services/UserService");
const uploadService = require('./FileService')
const ActivityHistoryService = require('../services/ActivityHistoryService');
const EmployeeService = require('../services/EmployeeService');
const Employee = require('../models/Employees');
const Investor = require('../models/Investor');

async function createDocument(userId, documentData, docFile) {
    try {
        const user = await UserService.getUserByID(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (docFile) {
            const docURL = await uploadService.uploadFile(docFile, 'Documents/' + user._id + "/uploadBy/" + user._id, docFile.originalname);
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

async function updateDocument(documentId, updateData, docFile) {
    try {
        const document = await Document.findById(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        if (docFile) {
            await uploadService.deleteFile(document.documentName, 'Documents/' + document.owner + "/uploadBy/" + document.owner)
            const docURL = await uploadService.uploadFile(docFile, 'Documents/' + document.owner + "/uploadBy/" + document.owner, docFile.originalname);
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

async function shareDocument(documentId, userIds, shareWithType) {
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

        if (!foundUserIds.length > 0) {
            throw new Error('One or more employees or investors not found');
        }

        document.shareWith = shareWithType;
        document.shareWithUsers = userIds;

        await document.save();
        const extension = document?.documentName?.split('.')?.pop();
        await ActivityHistoryService.createActivityHistory(
            document.owner,
            'document_shared',
            { targetName: `${document?.title}.${extension}`, targetDesc: `Document shared with users: ${userIds.join(', ')}`, to: shareWithType }
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

// async function getDocumentsForUser(userId, args) {
//     try {
//         const page = args?.page || 1; 
//         const pageSize = args?.pageSize || 8; 
//         const skip = (page - 1) * pageSize; 

//         const documents = await Document.find({ owner: userId })
//             .populate('owner')
//             .skip(skip) 
//             .sort({ uploadDate: 'desc' })
//             .limit(pageSize); 

//         // Compter le total de documents pour le calcul des pages
//         const totalCount = await Document.countDocuments({ owner: userId });
//         const totalPages = Math.ceil(totalCount / pageSize); 

//         return { documents, totalPages }; 
//     } catch (error) {
//         throw new Error('Error getting documents for member: ' + error.message);
//     }
// }

async function getDocumentsForUser(userId, args = {}) {
    try {
        const page = args.page || 1;
        const pageSize = args.pageSize || 8;
        const skip = (page - 1) * pageSize;

        // Récupérer les documents avec pagination
        const documents = await Document.find({ owner: userId })
            .populate('owner') // Charger les infos de l'owner
            .sort({ uploadDate: 'desc' }) // Trier par date décroissante
            .skip(skip)
            .limit(pageSize);

        // Récupérer les IDs des utilisateurs partagés
        const userIds = documents.flatMap((doc) => doc.shareWithUsers.map((id) => id.toString()));

        // Trouver les employés et investisseurs correspondant aux IDs
        const [employees, investors] = await Promise.all([
            Employee.find({ _id: { $in: userIds } }).select('fullName workEmail status jobTitle'),
            Investor.find({ _id: { $in: userIds } }).select('name companyName legalName type contactEmail'),
        ]);

        // Créer un dictionnaire pour un accès rapide aux utilisateurs
        const employeesMap = Object.fromEntries(employees.map((emp) => [emp._id.toString(), emp]));
        const investorsMap = Object.fromEntries(investors.map((inv) => [inv._id.toString(), inv]));

        // Formater les documents avec les utilisateurs partagés
        const formattedDocuments = documents.map((doc) => {
            const shareWithUsersInfos = doc.shareWithUsers.map((userId) => {
                if (employeesMap[userId]) {
                    const employee = employeesMap[userId];
                    return {
                        id: employee._id,
                        fullName: employee.fullName,
                        email: employee.workEmail,
                        type: employee.status,
                        userType: 'Employee',
                    };
                } else if (investorsMap[userId]) {
                    const investor = investorsMap[userId];
                    return {
                        id: investor._id,
                        fullName: investor?.name || investor?.companyName || investor?.legalName,
                        type: investor.type,
                        email: investor.contactEmail,
                        userType: 'Investor',
                    };
                }
                return null; // Si aucun utilisateur correspondant
            }).filter(Boolean); // Supprimer les utilisateurs non valides

            // Créer une chaîne de noms séparés par des virgules
            const shareWithUsersNames = shareWithUsersInfos.map((user) => user.fullName).join(', ');

            return {
                _id: doc._id,
                title: doc.title,
                documentName: doc.documentName,
                docType: doc.docType,
                uploadDate: doc.uploadDate,
                link: doc.link,
                owner: doc.owner,
                shareWithUsers: doc.shareWithUsers,
                shareWithUsersInfos,
                shareWithUsersNames, // Propriété pour les noms
            };
        });

        // Compter le nombre total de documents
        const totalCount = await Document.countDocuments({ owner: userId });
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            documents: formattedDocuments,
            totalDocuments: totalCount,
            totalPages,
            currentPage: page,
            pageSize,
        };
    } catch (error) {
        throw new Error('Error getting documents for user: ' + error.message);
    }
}

async function getDocumentSharedUsers(documentId) {
    try {
        // Find the document and populate the shareWithUsers field
        const document = await Document.findById(documentId)
            .populate({
                path: 'shareWithUsers',
                // Using $or to look in both Employee and Investor collections
                populate: {
                    path: 'shareWithUsers',
                    $or: [
                        { $ref: 'Employee' },
                        { $ref: 'Investor' }
                    ]
                }
            });

        if (!document) {
            throw new Error('Document not found');
        }

        // Get the user IDs from the document
        const userIds = document.shareWithUsers.map(id => id.toString());

        // Find all employees and investors that match these IDs
        const [employees, investors] = await Promise.all([
            Employee.find({
                _id: { $in: userIds }
            }).select('firstName lastName email role'),
            Investor.find({
                _id: { $in: userIds }
            }).select('firstName lastName email type')
        ]);

        // Combine and format the results
        const sharedUsers = {
            documentTitle: document.title,
            documentType: document.docType,
            shareType: document.shareWith,
            shareWithUsers: document.shareWithUsers,
            users: [
                ...employees.map(emp => ({
                    id: emp._id,
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                    email: emp.email,
                    role: emp.role,
                    userType: 'Employee'
                })),
                ...investors.map(inv => ({
                    id: inv._id,
                    firstName: inv.firstName,
                    lastName: inv.lastName,
                    email: inv.email,
                    type: inv.type,
                    userType: 'Investor'
                }))
            ]
        };

        return sharedUsers;

    } catch (error) {
        throw new Error('Error retrieving shared users: ' + error.message);
    }
}


async function searchDocuments(user, searchTerm) {
    try {
        const userRole = user?.role?.toLowerCase();
        const regex = new RegExp(searchTerm, 'i');
        let query;

        if (userRole === 'admin') {
            query = {
                $or: [{ title: regex },
                    // { documentName: regex }
                ]
            };
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


module.exports = {
    createDocument, updateDocument, getAllDocuments, getDocumentById,
    getDocumentsForUser, getDocumentsByUploader, deleteDocument, shareDocument,
    getShareWithData, searchDocuments
}
