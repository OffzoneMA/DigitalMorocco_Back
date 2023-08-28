const SubscriptionLogService = require("../services/SubscriptionLogService");



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


module.exports = { getAllLogs, getAllLogsByUser }