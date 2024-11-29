const SubscriptionLogService = require("../services/SubscriptionLogService");

const addSubscriptionLog = async (req, res) => {
    try {
        const log = await SubscriptionLogService.createSubscriptionLog(req.body);
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const listSubscriptionLogs = async (req, res) => {
    try {
        const logs = await SubscriptionLogService.getSubscriptionLogs(req.query);
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSubscriptionLog = async (req, res) => {
    try {
        const log = await SubscriptionLogService.getSubscriptionLogById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: 'Subscription log not found' });
        }
        res.status(200).json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const modifySubscriptionLog = async (req, res) => {
    try {
        const log = await SubscriptionLogService.updateSubscriptionLog(req.params.id, req.body);
        if (!log) {
            return res.status(404).json({ message: 'Subscription log not found' });
        }
        res.status(200).json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeSubscriptionLog = async (req, res) => {
    try {
        const log = await SubscriptionLogService.deleteSubscriptionLog(req.params.id);
        if (!log) {
            return res.status(404).json({ message: 'Subscription log not found' });
        }
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllLogs= async (req, res) => {
    try {
        const result = await SubscriptionLogService.getAllSubscriptionLogs(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}

const getAllLogsByUser = async (req, res) => {
    try {
        const result = await SubscriptionLogService.getAllSubscriptionLogsUser(req.memberId,req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}


module.exports = { getAllLogs, getAllLogsByUser , addSubscriptionLog, listSubscriptionLogs, 
    getSubscriptionLog, modifySubscriptionLog, removeSubscriptionLog}