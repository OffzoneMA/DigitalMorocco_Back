const InvestorAccessLog = require('../models/InvestorAccessLog');

/**
 * Génère une date au format YYYY-MM-DD (pour comparaison quotidienne)
 */
const getDayString = (date = new Date()) => {
    return date.toISOString().split('T')[0]; 
};

/**
 * Log un accès si aucun accès du jour n'existe encore
 */
const logAccess = async (userId, creditsDeducted = false) => {
    try {
        const today = getDayString();

        // Vérifie si un accès a déjà été loggé aujourd'hui
        const existingLog = await InvestorAccessLog.findOne({
            user: userId,
            accessDate: {
                $gte: new Date(`${today}T00:00:00.000Z`),
                $lte: new Date(`${today}T23:59:59.999Z`)
            }
        });

        if (existingLog) return existingLog;

        const accessLog = new InvestorAccessLog({
            user: userId,
            accessDate: new Date(),
            creditsDeducted
        });

        return await accessLog.save();
    } catch (error) {
        console.error("Erreur dans logAccess:", error);
        throw new Error("Impossible de logguer l'accès.");
    }
};

/**
 * Met à jour un log d'accès existant (ex: marquer creditsDeducted à true)
 */
const updateAccessLog = async (accessId, updates = {}) => {
    try {
        const accessLog = await InvestorAccessLog.findByIdAndUpdate(
            accessId,
            { $set: updates },
            { new: true }
        );
        if (!accessLog) throw new Error("Accès non trouvé.");
        return accessLog;
    } catch (error) {
        console.error("Erreur dans updateAccessLog:", error);
        throw new Error("Impossible de mettre à jour le log d'accès.");
    }
};

/**
 * Récupère tous les logs d'accès d'un utilisateur, triés du plus récent au plus ancien
 */
const getAccessLogsByUser = async (userId) => {
    try {
        return await InvestorAccessLog.find({ user: userId }).sort({ accessDate: -1 });
    } catch (error) {
        console.error("Erreur dans getAccessLogsByUser:", error);
        throw new Error("Impossible de récupérer les logs de l'utilisateur.");
    }
};

/**
 * Récupère le dernier log d'accès d'un utilisateur
 */
const getLastAccessLogByUser = async (userId) => {
    try {
        return await InvestorAccessLog.findOne({ user: userId }).sort({ accessDate: -1 });
    } catch (error) {
        console.error("Erreur dans getLastAccessLogByUser:", error);
        throw new Error("Impossible de récupérer le dernier accès.");
    }
};

/**
 * Récupère tous les logs à une date précise
 */
const getAccessLogsByDate = async (dateString) => {
    try {
        const start = new Date(`${dateString}T00:00:00.000Z`);
        const end = new Date(`${dateString}T23:59:59.999Z`);
        return await InvestorAccessLog.find({
            accessDate: { $gte: start, $lte: end }
        }).sort({ user: 1 });
    } catch (error) {
        console.error("Erreur dans getAccessLogsByDate:", error);
        throw new Error("Impossible de récupérer les logs à cette date.");
    }
};

/**
 * Récupère le log d'un utilisateur à une date donnée
 */
const getAccessLogsByUserAndDate = async (userId, dateString) => {
    try {
        const start = new Date(`${dateString}T00:00:00.000Z`);
        const end = new Date(`${dateString}T23:59:59.999Z`);
        return await InvestorAccessLog.findOne({
            user: userId,
            accessDate: { $gte: start, $lte: end }
        });
    } catch (error) {
        console.error("Erreur dans getAccessLogsByUserAndDate:", error);
        throw new Error("Impossible de récupérer le log pour l'utilisateur à cette date.");
    }
};

/**
 * Supprime un log d'accès
 */
const deleteAccessLog = async (accessId) => {
    try {
        const result = await InvestorAccessLog.findByIdAndDelete(accessId);
        if (!result) throw new Error("Log d'accès non trouvé.");
        return result;
    } catch (error) {
        console.error("Erreur dans deleteAccessLog:", error);
        throw new Error("Impossible de supprimer le log d'accès.");
    }
};

/**
 * Supprime tous les logs d'accès d'un utilisateur
 */
const deleteAccessLogsByUser = async (userId) => {
    try {
        const result = await InvestorAccessLog.deleteMany({ user: userId });
        return result;
    } catch (error) {
        console.error("Erreur dans deleteAccessLogsByUser:", error);
        throw new Error("Impossible de supprimer les logs d'accès.");
    }
};

/**
 * Exporte les fonctions du service
 */ 
module.exports = {
    logAccess, updateAccessLog, getAccessLogsByUser, getLastAccessLogByUser, getAccessLogsByDate,
    getAccessLogsByUserAndDate, deleteAccessLog, deleteAccessLogsByUser
};
