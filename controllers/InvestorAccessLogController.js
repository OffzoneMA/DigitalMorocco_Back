const accessLogService = require('../services/InvestorAccessLogService');

const logAccess = async (req, res) => {
    try {
        const { userId } = req.params;
        const {creditsDeducted = false } = req.body;
        const log = await accessLogService.logAccess(userId, creditsDeducted);
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAccessLog = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedLog = await accessLogService.updateAccessLog(id, updates);
        res.json(updatedLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAccessLogsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const logs = await accessLogService.getAccessLogsByUser(userId);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAccessLogsByConnectedUser = async (req, res) => {
    try {
        const userId = req.userId;
        const logs = await accessLogService.getAccessLogsByUser(userId);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getLastAccessLogByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const log = await accessLogService.getLastAccessLogByUser(userId);
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLastAccessLogByConnectedUser = async (req, res) => {
    try {
        const userId = req.userId;
        const log = await accessLogService.getLastAccessLogByUser(userId);
        res.json(log);
    } catch (error) {
        console.log("Erreur dans getLastAccessLogByConnectedUser:", error);
        res.status(500).json({ message: error.message });
    }   
};

const getAccessLogsByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const logs = await accessLogService.getAccessLogsByDate(date);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAccessLogsByUserAndDate = async (req, res) => {
    try {
        const { userId, date } = req.params;
        const log = await accessLogService.getAccessLogsByUserAndDate(userId, date);
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    logAccess, updateAccessLog, getAccessLogsByUser, getLastAccessLogByUser, getAccessLogsByDate, 
    getAccessLogsByUserAndDate, getAccessLogsByConnectedUser, getLastAccessLogByConnectedUser
}