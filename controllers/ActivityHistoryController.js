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
        const userId = req.userId;
        const activityHistories = await ActivityHistoryService.getAllActivityHistoriesByUser(userId);
        res.status(200).json(activityHistories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function deleteActivity(req, res) {
    try {
        const id = req.params.id;
        await ActivityHistoryService.deleteActivityHistory(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting activity history: ' + error.message });
    }
}

module.exports = { createActivityHistoryController, getAllActivityHistoriesController ,
getAllActivityHistoriesByUser , deleteActivity };
