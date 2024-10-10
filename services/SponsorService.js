const Sponsor = require('../models/Sponsor');
const Event = require('../models/Event');
const Partner = require('../models/Partner');  // Si un modèle de partenaire existe

// Création d'un sponsor avec validation
const createSponsor = async (partnerId, eventId, sponsorshipAmount, sponsorshipType, requestType) => {
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

        // Validation du montant
        if (sponsorshipAmount <= 0) {
            throw new Error('Sponsorship amount must be greater than zero');
        }

        // Création du sponsor
        const sponsor = new Sponsor({
            partnerId,
            eventId,
            sponsorshipAmount,
            sponsorshipType,
            requestType
        });

        await sponsor.save();

        // Mise à jour de l'événement avec le nouveau sponsor
        await Event.findByIdAndUpdate(eventId, { $push: { sponsors: sponsor._id } });

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
        if (exactDate) {
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
const approveSponsor = async (sponsorId, letter) => {
    try {
        const sponsor = await Sponsor.findByIdAndUpdate(sponsorId, { status: 'Approved', letter: letter }, { new: true });
        if (!sponsor) {
            throw new Error('Sponsor not found');
        }
        return sponsor;
    } catch (error) {
        console.error(`Error approving sponsor: ${error.message}`);
        throw new Error(`Error approving sponsor: ${error.message}`);
    }
};

// Rejeter un sponsor avec un motif
const rejectSponsor = async (sponsorId, reasonForRejection) => {
    try {
        if (!reasonForRejection) {
            throw new Error('Reason for rejection is required');
        }

        const sponsor = await Sponsor.findByIdAndUpdate(
            sponsorId,
            { status: 'Rejected', reasonForRejection },
            { new: true }
        );

        if (!sponsor) {
            throw new Error('Sponsor not found');
        }

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
        const page = args?.page || 1;
        const pageSize = args?.pageSize || 10;

        // Extraction des paramètres de filtrage
        const { status, requestType, exactDate, location, sponsorshipType } = args;

        // Construire la requête de base avec le partenaire
        const query = { partnerId };

        // Filtrage par statut si fourni
        if (status) {
            query.status = status;
        }

        // Filtrage par type de requête (envoyée ou reçue)
        if (requestType) {
            query.requestType = requestType;
        }

        // Filtrage par date si une date précise est fournie
        if (exactDate) {
            const startOfDay = new Date(exactDate);
            startOfDay.setHours(0, 0, 0, 0);  // Début de la journée
            const endOfDay = new Date(exactDate);
            endOfDay.setHours(23, 59, 59, 999);  // Fin de la journée
            query.dateCreated = { $gte: startOfDay, $lt: endOfDay };
        }

        // Filtrage par emplacement de l'événement si fourni
        let eventIds = [];
        if (location) {
            const eventsWithLocation = await Event.find({ location: location }).select('_id');
            eventIds = eventsWithLocation.map(event => event._id);
            query.eventId = { $in: eventIds };
        }

        // Filtrage par type de sponsoring si fourni
        if (sponsorshipType) {
            query.sponsorshipType = sponsorshipType;
        }

        // Récupération des sponsors avec la requête construite
        const sponsors = await Sponsor.find(query)
            .populate("eventId")
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
        console.error(`Error fetching sponsors by partner: ${error.message}`);
        throw new Error(`Error fetching sponsors by partner: ${error.message}`);
    }
};

const getApprovedSponsorsForPastEvents = async (args) => {
    try {
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
        if (exactDate) {
            const startOfDay = new Date(exactDate);
            startOfDay.setHours(0, 0, 0, 0);  // Début de la journée
            const endOfDay = new Date(exactDate);
            endOfDay.setHours(23, 59, 59, 999);  // Fin de la journée
            query.dateCreated = { $gte: startOfDay, $lt: endOfDay };
        }

        // Récupérer tous les sponsors approuvés pour ces événements
        const approvedSponsors = await Sponsor.find(query)
            .populate("partnerId eventId")
            .sort({ createdAt: -1 }); // Optionnel : trier par date de création

        return approvedSponsors;
    } catch (error) {
        console.error(`Error fetching approved sponsors for past events: ${error.message}`);
        throw new Error(`Error fetching approved sponsors for past events: ${error.message}`);
    }
};

// services/SponsorService.js
const getApprovedSponsorsForPartner = async (partnerId, args) => {
    try {
        // Récupérer la date actuelle
        const currentDate = new Date();

        // Récupérer les événements passés
        const pastEvents = await Event.find({ startDate: { $lt: currentDate } }).select('_id');

        const pastEventIds = pastEvents.map(event => event._id);

        // Construire la requête de base pour récupérer les sponsors
        const query = {
            status: 'Approved',
            partnerId,
            eventId: { $in: pastEventIds }
        };

        // Extraction des paramètres de filtrage
        const { sponsorshipType, exactDate } = args;

        // Filtrage par type de sponsoring si fourni
        if (sponsorshipType) {
            query.sponsorshipType = sponsorshipType;
        }

        // Filtrage par date si une date précise est fournie
        if (exactDate) {
            const startOfDay = new Date(exactDate);
            startOfDay.setHours(0, 0, 0, 0);  // Début de la journée
            const endOfDay = new Date(exactDate);
            endOfDay.setHours(23, 59, 59, 999);  // Fin de la journée
            query.dateCreated = { $gte: startOfDay, $lt: endOfDay };
        }

        // Récupérer tous les sponsors approuvés pour le partenaire donné et les événements passés
        const approvedSponsors = await Sponsor.find(query)
            .populate('partnerId eventId')
            .sort({ createdAt: -1 }); // Optionnel : trier par date de création

        return approvedSponsors;
    } catch (error) {
        console.error(`Error fetching approved sponsors for partner: ${error.message}`);
        throw new Error(`Error fetching approved sponsors for partner: ${error.message}`);
    }
};


module.exports = {
    createSponsor, getAllSponsors,getSponsorById, approveSponsor, rejectSponsor, updateSponsor,
    deleteSponsor, getSponsorsByPartner , getApprovedSponsorsForPastEvents, getApprovedSponsorsForPartner,
};
