const SponsorService = require('../services/SponsorService');

// Création d'un sponsor
const createSponsor = async (req, res) => {
    const {eventId, sponsorshipAmount, sponsorshipType, letter , requestType } = req.body;
    try {
        const sponsor = await SponsorService.createSponsor(req.partnerId, eventId, sponsorshipAmount, sponsorshipType, letter , requestType , req?.file);
        return res.status(201).json(sponsor);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const createSponsorForPartner = async (req, res) => {
    const {eventId, sponsorshipAmount, sponsorshipType, letter , requestType } = req.body;
    try {
        const sponsor = await SponsorService.createSponsor(req.params.partnerId, eventId, sponsorshipAmount, sponsorshipType, letter , requestType , req?.file);
        return res.status(201).json(sponsor);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// Récupérer tous les sponsors
const getAllSponsors = async (req, res) => {
    try {
        const sponsors = await SponsorService.getAllSponsors(req.query);
        return res.status(200).json(sponsors);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Récupérer un sponsor par ID
const getSponsorById = async (req, res) => {
    const { sponsorId } = req.params;
    try {
        const sponsor = await SponsorService.getSponsorById(sponsorId);
        return res.status(200).json(sponsor);
    } catch (error) {
        return res.status(404).json({ error: error.message });
    }
};

// Approuver un sponsor
const approveSponsor = async (req, res) => {
    const { sponsorId } = req.params;
    const { sponsorshipType , approvalLetter } = req.body;
    try {
        const sponsor = await SponsorService.approveSponsor(sponsorId, sponsorshipType ,approvalLetter);
        return res.status(200).json(sponsor);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// Rejeter un sponsor
const rejectSponsor = async (req, res) => {
    const { sponsorId } = req.params;
    const { reasonForRejection , rejectionNotes } = req.body;
    try {
        const sponsor = await SponsorService.rejectSponsor(sponsorId, reasonForRejection , rejectionNotes);
        return res.status(200).json(sponsor);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// Mise à jour d'un sponsor
const updateSponsor = async (req, res) => {
    const { sponsorId } = req.params;
    const updateData = req.body;
    try {
        const sponsor = await SponsorService.updateSponsor(sponsorId, updateData);
        return res.status(200).json(sponsor);
    } catch (error) {
        return res.status(404).json({ error: error.message });
    }
};

// Supprimer un sponsor
const deleteSponsor = async (req, res) => {
    const { sponsorId } = req.params;
    try {
        const sponsor = await SponsorService.deleteSponsor(sponsorId);
        return res.status(204).json(sponsor);
    } catch (error) {
        return res.status(404).json({ error: error.message });
    }
};

// Récupérer tous les sponsors d'un partenaire spécifique
const getSponsorsByPartner = async (req, res) => {
    try {
        const sponsors = await SponsorService.getSponsorsByPartner(req.partnerId, req.query);
        return res.status(200).json(sponsors);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getSponsorsHistoryByPartner = async (req, res) => {
    try {
        const sponsors = await SponsorService.getSponsorsHistoryByPartner(req.partnerId, req.query);
        return res.status(200).json(sponsors);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Récupérer les sponsors approuvés pour des événements passés
const getApprovedSponsorsForPastEvents = async (req, res) => {
    try {
        const sponsors = await SponsorService.getApprovedSponsorsForPastEvents(req.query);
        return res.status(200).json(sponsors);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Récupérer les sponsors approuvés pour un partenaire donné
const getApprovedSponsorsForPartner = async (req, res) => {
    try {
        const sponsors = await SponsorService.getApprovedSponsorsForPartner(req.partnerId , req.query);
        return res.status(200).json(sponsors);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getDistinctEventFieldsByPartner =  async (req, res) => {
    try {
        const { field } = req.query;
        const { eventStatus , sponsorStatus } = req.query; // Récupérer le statut depuis les paramètres de requête

        // Vérifiez que le champ est fourni
        if (!field) {
            return res.status(400).json({ message: 'Field query parameter is required.' });
        }

        const distinctValues = await SponsorService.getDistinctEventFieldsByPartner(req.partnerId, field, eventStatus , sponsorStatus); // Passer le statut à la fonction

        return res.status(200).json(distinctValues);
    } catch (error) {
        console.error(`Error in getDistinctEventFieldsByPartner: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
}

const getDistinctEventFieldsByPartnerHistory =  async (req, res) => {
    try {
        const { field } = req.query;
        const { eventStatus , sponsorStatus } = req.query; // Récupérer le statut depuis les paramètres de requête

        // Vérifiez que le champ est fourni
        if (!field) {
            return res.status(400).json({ message: 'Field query parameter is required.' });
        }

        const distinctValues = await SponsorService.getDistinctEventFieldsByPartnerHistory(req.partnerId, field, eventStatus , sponsorStatus); // Passer le statut à la fonction

        return res.status(200).json(distinctValues);
    } catch (error) {
        console.error(`Error in getDistinctEventFieldsByPartner: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createSponsor, getAllSponsors, getSponsorById, approveSponsor, rejectSponsor,
    updateSponsor, deleteSponsor, getSponsorsByPartner, getApprovedSponsorsForPastEvents,
    getApprovedSponsorsForPartner, getDistinctEventFieldsByPartner , createSponsorForPartner , 
    getSponsorsHistoryByPartner , getDistinctEventFieldsByPartnerHistory
};
