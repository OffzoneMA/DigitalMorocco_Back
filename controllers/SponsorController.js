const SponsorService = require('../services/SponsorService');

// Création d'un sponsor
const createSponsor = async (req, res) => {
    const { partnerId, eventId, sponsorshipAmount, sponsorshipType, requestType } = req.body;
    try {
        const sponsor = await SponsorService.createSponsor(partnerId, eventId, sponsorshipAmount, sponsorshipType, requestType);
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
    const { letter } = req.body;
    try {
        const sponsor = await SponsorService.approveSponsor(sponsorId, letter);
        return res.status(200).json(sponsor);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// Rejeter un sponsor
const rejectSponsor = async (req, res) => {
    const { sponsorId } = req.params;
    const { reasonForRejection } = req.body;
    try {
        const sponsor = await SponsorService.rejectSponsor(sponsorId, reasonForRejection);
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
    const { partnerId } = req.params;
    try {
        const sponsors = await SponsorService.getSponsorsByPartner(partnerId, req.query);
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
    const { partnerId } = req.params;
    try {
        const sponsors = await SponsorService.getApprovedSponsorsForPartner(partnerId , req.query);
        return res.status(200).json(sponsors);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createSponsor, getAllSponsors, getSponsorById, approveSponsor, rejectSponsor,
    updateSponsor, deleteSponsor, getSponsorsByPartner, getApprovedSponsorsForPastEvents,
    getApprovedSponsorsForPartner,
};
