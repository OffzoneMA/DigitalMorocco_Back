// activityHistoryController.js

const ActivityHistoryService = require('../services/ActivityHistoryService');

async function createActivityHistoryController(req, res) {
    try {
        const activityHistory = await ActivityHistoryService.createActivityHistory(req.body);
        res.status(201).json(activityHistory);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getAllActivityHistoriesController(req, res) {
    try {
        const activityHistories = await ActivityHistoryService.getAllActivityHistories();
        res.status(200).json(activityHistories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAllActivityHistoriesByUser = async (req, res) => {
    try {
        const memberId = req.params.memberId;
        const activityHistories = await ActivityHistoryService.getAllActivityHistoriesByUser(memberId);
        res.status(200).json(activityHistories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { createActivityHistoryController, getAllActivityHistoriesController ,
getAllActivityHistoriesByUser };
