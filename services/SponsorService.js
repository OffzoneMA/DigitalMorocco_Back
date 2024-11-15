const Sponsor = require('../models/Sponsor');
const Event = require('../models/Event');
const Partner = require('../models/Partner');  // Si un modèle de partenaire existe
const uploadService = require('../services/FileService');
const ActivityHistoryService = require('../services/ActivityHistoryService');


// Création d'un sponsor avec validation
const createSponsor = async (partnerId, eventId, sponsorshipAmount, sponsorshipType , letter, requestType, document) => {
    try {
        // Vérification de l'existence du partenaire
        const partner = await Partner.findById(partnerId);
        if (!partner) {
            throw new Error('Partner not found');
        }

        // Vérification de l'existence de l'événement
        const event = await Event.findById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        let docLink = null;

        // Gestion de l'upload du document, si présent
        if (document) {
            try {
                docLink = await uploadService.uploadFile(document, `Sponsors/${partner?.owner}`, document.originalname);
            } catch (uploadError) {
                throw new Error('Failed to upload document');
            }
        }

        // Création du sponsor
        const sponsor = new Sponsor({
            partnerId,
            eventId,
            sponsorshipAmount,
            sponsorshipType: sponsorshipType, 
            letter, 
            requestType,
            document: document ? {
                name: document.originalname,
                link: docLink
            } : null  // Si aucun document n'est fourni, enregistrer null
        });

        // Sauvegarde du sponsor en base de données
        await sponsor.save();

        // Mise à jour de l'événement pour y ajouter le sponsor
        await Event.findByIdAndUpdate(eventId, { 
            $push: { 
                sponsorsRequests: sponsor?._id, 
                sponsorsPartners: partner?._id 
            } 
        });
        
        await ActivityHistoryService.createActivityHistory(
            partner?.owner,
            'sponsor_request_send',
            { targetName: event?.title, targetDesc: `` }
        );

        return sponsor;
    } catch (error) {
        console.error(`Error creating sponsor: ${error.message}`);
        throw new Error(`Error creating sponsor: ${error.message}`);
    }
};

// Récupérer tous les sponsors avec pagination et filtrage par statut
const getAllSponsors = async (args) => {
    try {
        const page = args?.page || 1;
        const pageSize = args?.pageSize || 10;

        // Extraction des paramètres de filtrage
        const { status, requestType, exactDate, location, sponsorshipType } = args;

        // Construire la requête de base
        const query = {};

        // Filtrage par statut si fourni (Pending, Approved, Rejected)
        if (status) {
            query.status = status;
        }

        // Filtrage par type de requête (envoyée ou reçue)
        if (requestType) {
            query.requestType = requestType;
        }

        // Filtrage par date si une date précise est fournie
        if (exactDate && exactDate !== 'Invalid Date') {
            const startOfDay = new Date(exactDate);
            startOfDay.setHours(0, 0, 0, 0);  // Début de la journée
            const endOfDay = new Date(exactDate);
            endOfDay.setHours(23, 59, 59, 999);  // Fin de la journée
            query.dateCreated = { $gte: startOfDay, $lt: endOfDay };
        }

        // Filtrage par emplacement de l'événement
        let eventIds = [];
        if (location) {
            const eventsWithLocation = await Event.find({ physicalLocation: location }).select('_id');
            eventIds = eventsWithLocation.map(event => event._id);
            query.eventId = { $in: eventIds };
        }

        // Filtrage par type de sponsoring si fourni
        if (sponsorshipType) {
            query.sponsorshipType = sponsorshipType;
        }

        // Récupération des sponsors avec la requête construite
        const sponsors = await Sponsor.find(query)
            .populate("partnerId eventId")
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .sort({ createdAt: -1 });

        // Comptage du total des documents correspondant à la requête
        const total = await Sponsor.countDocuments(query);

        // Gestion des cas où aucun sponsor n'est trouvé
        if (total === 0) {
            return {
                data: [],
                total,
                page,
                pageSize,
                totalPages: 0,
                message: 'No sponsors found for the given criteria.'
            };
        }

        return {
            data: sponsors,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    } catch (error) {
        console.error(`Error fetching sponsors: ${error.message}`);
        throw new Error(`Error fetching sponsors: ${error.message}`);
    }
};


// Récupérer un sponsor par ID
const getSponsorById = async (sponsorId) => {
    try {
        const sponsor = await Sponsor.findById(sponsorId).populate("partnerId eventId");
        if (!sponsor) {
            throw new Error('Sponsor not found');
        }
        return sponsor;
    } catch (error) {
        console.error(`Error fetching sponsor by ID: ${error.message}`);
        throw new Error(`Error fetching sponsor by ID: ${error.message}`);
    }
};

// Approuver un sponsor avec une lettre d'approbation
const approveSponsor = async (sponsorId, sponsorshipType , letter) => {
    try {
        const sponsor = await Sponsor.findByIdAndUpdate(sponsorId, { status: 'Approved', sponsorshipType: sponsorshipType , approvalLetter: letter }, { new: true }).populate("partnerId eventId");
        if (!sponsor) {
            throw new Error('Sponsor not found');
        }

        await ActivityHistoryService.createActivityHistory(
            sponsor?.partnerId?.owner,
            'sponsor_request_approved',
            { targetName: sponsor?.eventId?.title, targetDesc: `` }
        );
        return sponsor;
    } catch (error) {
        console.error(`Error approving sponsor: ${error.message}`);
        throw new Error(`Error approving sponsor: ${error.message}`);
    }
};

// Rejeter un sponsor avec un motif
const rejectSponsor = async (sponsorId, reasonForRejection , letter) => {
    try {
        if (!reasonForRejection) {
            throw new Error('Reason for rejection is required');
        }

        const sponsor = await Sponsor.findByIdAndUpdate(
            sponsorId,
            { status: 'Rejected', reasonForRejection , rejectLetter: letter},
            { new: true }
        ).populate("partnerId eventId");

        if (!sponsor) {
            throw new Error('Sponsor not found');
        }

        await ActivityHistoryService.createActivityHistory(
            sponsor?.partnerId?.owner,
            'sponsor_request_rejected',
            { targetName: sponsor?.eventId?.title, targetDesc: `` }
        );

        return sponsor;
    } catch (error) {
        console.error(`Error rejecting sponsor: ${error.message}`);
        throw new Error(`Error rejecting sponsor: ${error.message}`);
    }
};

// Mise à jour d'un sponsor
const updateSponsor = async (sponsorId, updateData) => {
    try {
        const sponsor = await Sponsor.findByIdAndUpdate(sponsorId, updateData, { new: true });
        if (!sponsor) {
            throw new Error('Sponsor not found');
        }
        return sponsor;
    } catch (error) {
        console.error(`Error updating sponsor: ${error.message}`);
        throw new Error(`Error updating sponsor: ${error.message}`);
    }
};

// Supprimer un sponsor
const deleteSponsor = async (sponsorId) => {
    try {
        const sponsor = await Sponsor.findByIdAndDelete(sponsorId);
        if (!sponsor) {
            throw new Error('Sponsor not found');
        }
        return sponsor;
    } catch (error) {
        console.error(`Error deleting sponsor: ${error.message}`);
        throw new Error(`Error deleting sponsor: ${error.message}`);
    }
};

// Récupérer tous les sponsors d'un partenaire spécifique
const getSponsorsByPartner = async (partnerId, args) => {
    try {
      const requestedPage = parseInt(args?.page, 10) || 1;
      const pageSize = parseInt(args?.pageSize, 10) || 8;
  
      const { status, requestType, exactDate, location, sponsorshipType } = args;
      const query = { partnerId };
  
      if (status && status?.length > 0) {
        query.status = { $in: status.split(',') };
      }
  
      // Filtrage par type de requête (envoyée ou reçue)
      if (requestType && requestType.length > 0) {
        query.requestType = { $in: requestType.split(',') };
      }
  
      if (exactDate && exactDate !== 'Invalid Date') {
        const startOfDay = new Date(exactDate);
        startOfDay.setHours(0, 0, 0, 0);  // Début de la journée
        const endOfDay = new Date(exactDate);
        endOfDay.setHours(23, 59, 59, 999);  // Fin de la journée
        query.dateCreated = { $gte: startOfDay, $lt: endOfDay };
      }
  
      let eventIds = [];
      if (location) {
        const eventsWithLocation = await Event.find({ physicalLocation: location }).select('_id');
        eventIds = eventsWithLocation.map(event => event._id);
        query.eventId = { $in: eventIds };
      }
  
      if (sponsorshipType && sponsorshipType?.length > 0) {
        query.sponsorshipType = { $in: sponsorshipType.split(',') };
      }
  
      const total = await Sponsor.countDocuments(query);
  
      const totalPages = Math.ceil(total / pageSize);
  
      // Vérifier que la page demandée ne dépasse pas le nombre total de pages
      const currentPage = requestedPage > totalPages ? 1 : requestedPage;
  
      const skip = (currentPage - 1) * pageSize;
  
      const sponsors = await Sponsor.find(query)
        .populate("eventId")
        .skip(skip)
        .limit(pageSize)
        .sort({ dateCreated: 'desc' });
  
      // Si aucun sponsor n'est trouvé
      if (total === 0) {
        return {
          data: [],
          total,
          page: currentPage,
          pageSize,
          totalPages,
          currentPage,
          message: 'No sponsors found for the given criteria.'
        };
      }
  
      return {
        data: sponsors,
        total,
        page: currentPage,
        pageSize,
        totalPages,
        currentPage
      };
    } catch (error) {
      throw new Error(`Error fetching sponsors by partner: ${error.message}`);
    }
};  

const getSponsorsHistoryByPartner = async (partnerId, args) => {
    try {
        const requestedPage = parseInt(args?.page, 10) || 1;
        const pageSize = parseInt(args?.pageSize, 10) || 8;

        const { status, requestType, exactDate, location, sponsorshipType } = args;
        const query = { partnerId };

        query.$nor = [
            { requestType: 'Received', status: 'Pending' }
        ];

        if (status && status.length > 0) {
            query.status = { $in: status.split(',') };
        }

        if (requestType && requestType.length > 0) {
            query.requestType = { $in: requestType.split(',') };
        }

        if (exactDate && exactDate !== 'Invalid Date') {
            const startOfDay = new Date(exactDate);
            startOfDay.setHours(0, 0, 0, 0);  // Début de la journée
            const endOfDay = new Date(exactDate);
            endOfDay.setHours(23, 59, 59, 999);  // Fin de la journée
            query.dateCreated = { $gte: startOfDay, $lt: endOfDay };
        }

        let eventIds = [];
        if (location) {
            const eventsWithLocation = await Event.find({ physicalLocation: location }).select('_id');
            eventIds = eventsWithLocation.map(event => event._id);
            query.eventId = { $in: eventIds };
        }

        if (sponsorshipType && sponsorshipType.length > 0) {
            query.sponsorshipType = { $in: sponsorshipType.split(',') };
        }

        const totalCount = await Sponsor.countDocuments(query);

        const totalPages = Math.ceil(totalCount / pageSize);

        const currentPage = requestedPage > totalPages ? 1 : requestedPage;

        const skip = (currentPage - 1) * pageSize;

        const sponsors = await Sponsor.find(query)
            .populate("eventId")
            .skip(skip)
            .limit(pageSize)
            .sort({ dateCreated: 'desc' });

        // Si aucun sponsor n'est trouvé
        if (totalCount === 0) {
            return {
                data: [],
                total: totalCount,
                page: currentPage,
                pageSize,
                totalPages,
                currentPage,
                message: 'No sponsors found for the given criteria.'
            };
        }

        return {
            data: sponsors,
            total: totalCount,
            page: currentPage,
            pageSize,
            totalPages,
            currentPage
        };
    } catch (error) {
        throw new Error(`Error fetching sponsors history by partner: ${error.message}`);
    }
};


const getApprovedSponsorsForPastEvents = async (args) => {
    try {
        // Pagination
        const requestedPage = parseInt(args?.page, 10) || 1;
        const pageSize = parseInt(args?.pageSize, 10) || 8;
        const skip = (requestedPage - 1) * pageSize;

        // Obtenir la date actuelle
        const currentDate = new Date();

        // Récupérer tous les événements passés
        const pastEvents = await Event.find({ endDate: { $lt: currentDate } }).select('_id');
        const eventIds = pastEvents.map(event => event._id);

        // Construire la requête de base pour récupérer les sponsors
        const query = {
            eventId: { $in: eventIds },
            status: 'Approved'
        };

        // Extraction des paramètres de filtrage
        const { sponsorshipType, partnerId, exactDate } = args;

        // Filtrage par type de sponsoring si fourni
        if (sponsorshipType) {
            query.sponsorshipType = sponsorshipType;
        }

        // Filtrage par partenaire si fourni
        if (partnerId) {
            query.partnerId = partnerId;
        }

        // Filtrage par date si une date précise est fournie
        if (exactDate && exactDate !== 'Invalid Date') {
            const startOfDay = new Date(exactDate);
            startOfDay.setHours(0, 0, 0, 0);  // Début de la journée
            const endOfDay = new Date(exactDate);
            endOfDay.setHours(23, 59, 59, 999);  // Fin de la journée
            query.dateCreated = { $gte: startOfDay, $lt: endOfDay };
        }

        // Comptage du nombre total de sponsors avec la requête appliquée
        const totalCount = await Sponsor.countDocuments(query);

        // Calcul du total de pages
        const totalPages = Math.ceil(totalCount / pageSize);

        // Vérifier que la page demandée ne dépasse pas le nombre total de pages
        const currentPage = requestedPage > totalPages ? 1 : requestedPage;

        // Calcul du skip en fonction de la page actuelle
        const finalSkip = (currentPage - 1) * pageSize;

        // Récupérer les sponsors approuvés pour ces événements
        const approvedSponsors = await Sponsor.find(query)
            .populate("partnerId eventId")
            .skip(finalSkip)
            .limit(pageSize)
            .sort({ createdAt: -1 }); // Optionnel : trier par date de création

        return {
            data: approvedSponsors,
            total: totalCount,
            page: currentPage,
            pageSize,
            totalPages,
            currentPage
        };
    } catch (error) {
        console.error(`Error fetching approved sponsors for past events: ${error.message}`);
        throw new Error(`Error fetching approved sponsors for past events: ${error.message}`);
    }
};


// services/SponsorService.js
const getApprovedSponsorsForPartner = async (partnerId, args) => {
    try {
        const currentDate = new Date();

        const { sponsorshipType, exactDate, page = 1, pageSize = 8, location } = args;

        let eventQuery = { startDate: { $lt: currentDate } };

        if (location) {
            eventQuery.physicalLocation = location;
        }

        const pastEvents = await Event.find(eventQuery).select('_id');
        const pastEventIds = pastEvents.map(event => event._id);

        const query = {
            status: 'Approved',
            partnerId,
            eventId: { $in: pastEventIds }
        };

        if (sponsorshipType && sponsorshipType?.length > 0) {
            query.sponsorshipType = { $in: sponsorshipType.split(',') };
        }

        if (exactDate && exactDate !== 'Invalid Date') {
            const startOfDay = new Date(exactDate);
            startOfDay.setHours(0, 0, 0, 0);  // Début de la journée
            const endOfDay = new Date(exactDate);
            endOfDay.setHours(23, 59, 59, 999);  // Fin de la journée
            query.dateCreated = { $gte: startOfDay, $lt: endOfDay };
        }

        const totalSponsors = await Sponsor.countDocuments(query);

        const totalPages = Math.ceil(totalSponsors / pageSize);

        const currentPage = page > totalPages ? 1 : page;

        const skip = (currentPage - 1) * pageSize;

        const approvedSponsors = await Sponsor.find(query)
            .populate('partnerId eventId')
            .sort({ dateCreated: 'desc' })  
            .skip(skip)  
            .limit(pageSize);  

        return {
            data: approvedSponsors,
            totalSponsors,
            totalPages,
            currentPage,  
            pageSize
        };
    } catch (error) {
        throw new Error(`Error fetching approved sponsors for partner: ${error.message}`);
    }
};

const getDistinctEventFieldsByPartner = async (partnerId, field, eventStatus, sponsorStatus) => {
    try {
        const sponsorQuery = { partnerId };

        // Ajouter le filtre par statut du sponsor si fourni
        if (sponsorStatus) {
            sponsorQuery.status = { $in: sponsorStatus.split(',') };
        }

        // Récupérer les sponsors associés au partenaire et au statut du sponsor
        const sponsors = await Sponsor.find(sponsorQuery).select('eventId');

        const eventIds = sponsors.map(sponsor => sponsor.eventId);

        // Vérifiez s'il n'y a pas d'événements sponsorisés
        if (eventIds.length === 0) {
            return {
                data: [],
                message: 'No sponsored events found for this partner.'
            };
        }

        // Construire la requête de filtrage des événements par ID et par statut de l'événement
        const eventQuery = { _id: { $in: eventIds } };

        // Ajouter le filtre de statut d'événement si fourni
        if (eventStatus) {
            eventQuery.status = { $in: eventStatus.split(',') };
        }

        // Récupérer les valeurs distinctes du champ spécifié
        const distinctValues = await Event.distinct(field, eventQuery);

        return {
            data: distinctValues,
            message: `Distinct values for field '${field}' retrieved successfully.`
        };
    } catch (error) {
        throw new Error(`Error fetching distinct event fields: ${error.message}`);
    }
};

const getDistinctEventFieldsByPartnerHistory = async (partnerId, field, eventStatus, sponsorStatus) => {
    try {
        const sponsorQuery = { partnerId };

        // Ajouter le filtre par statut du sponsor si fourni
        if (sponsorStatus) {
            sponsorQuery.status = { $in: sponsorStatus.split(',') };
        }

        // Exclure les sponsors avec requestType 'Received' et status 'Pending'
        sponsorQuery.$nor = [
            { requestType: 'Received', status: 'Pending' }
        ];

        // Récupérer les sponsors associés au partenaire et au statut du sponsor
        const sponsors = await Sponsor.find(sponsorQuery).select('eventId');

        const eventIds = sponsors.map(sponsor => sponsor.eventId);

        // Vérifiez s'il n'y a pas d'événements sponsorisés
        if (eventIds.length === 0) {
            return {
                data: [],
                message: 'No sponsored events found for this partner.'
            };
        }

        // Construire la requête de filtrage des événements par ID et par statut de l'événement
        const eventQuery = { _id: { $in: eventIds } };

        // Ajouter le filtre de statut d'événement si fourni
        if (eventStatus) {
            eventQuery.status = { $in: eventStatus.split(',') };
        }

        // Récupérer les valeurs distinctes du champ spécifié
        const distinctValues = await Event.distinct(field, eventQuery);

        return {
            data: distinctValues,
            message: `Distinct values for field '${field}' retrieved successfully.`
        };
    } catch (error) {
        throw new Error(`Error fetching distinct event fields: ${error.message}`);
    }
};

const getRecentSponsorsByStatus = async (partnerId, status, requestType) => {
    try {
        const query = { 
            partnerId 
        };

        // Filtrage par status
        if (status != null && status !== '') {
            query.status = status;
        }

        // Filtrage par requestType
        if (requestType != null && requestType !== '') {
            query.requestType = requestType;
        }

        // Récupérer les 3 sponsors les plus récents avec les filtres fournis
        const recentSponsors = await Sponsor.find(query)
            .populate("eventId")  
            .limit(3) 
            .sort({ dateCreated: 'desc' });

        // Vérification si des sponsors sont trouvés
        if (recentSponsors.length === 0) {
            return {
                data: [],
                message: `No sponsors found with status: ${status} and request type: ${requestType}`
            };
        }

        // Retourner les sponsors trouvés
        return {
            data: recentSponsors,
            message: `Successfully retrieved recent sponsors with status: ${status} and request type: ${requestType}`
        };
    } catch (error) {
        throw new Error(`Error fetching recent sponsors by status and request type: ${error.message}`);
    }
};

const countApprovedSponsorsByPartner = async (partnerId) => {
    try {
        const query = { 
            partnerId, 
            status: 'Approved' 
        };

        const approvedSponsorsCount = await Sponsor.countDocuments(query);
        return {
            count: approvedSponsorsCount,
            message: `Successfully counted ${approvedSponsorsCount} approved sponsors for partner: ${partnerId}`
        };
    } catch (error) {
        throw new Error(`Error counting approved sponsors by partner: ${error.message}`);
    }
};

const countRequestsByPartner = async (partnerId) => {
    try {
        // Count all requests for the given partner
        const totalRequestsCount = await Sponsor.countDocuments({ partnerId });

        // Count requests with both status 'Pending' and requestType 'Received'
        const currentRequestsCount = await Sponsor.countDocuments({ 
            partnerId, 
            status: 'Pending', 
            requestType: 'Received' 
        });

        return {
            totalRequestsCount,
            currentRequestsCount,
            message: `Successfully counted ${totalRequestsCount} total requests and ${currentRequestsCount} pending received requests for partner: ${partnerId}`
        };
    } catch (error) {
        throw new Error(`Error counting requests for partner: ${error.message}`);
    }
};



module.exports = {
    createSponsor, getAllSponsors,getSponsorById, approveSponsor, rejectSponsor, updateSponsor,
    deleteSponsor, getSponsorsByPartner , getApprovedSponsorsForPastEvents, getApprovedSponsorsForPartner,
    getDistinctEventFieldsByPartner , getSponsorsHistoryByPartner , getDistinctEventFieldsByPartnerHistory ,
    getRecentSponsorsByStatus , countApprovedSponsorsByPartner , countRequestsByPartner
};
