const RequestService = require("../services/RequestService");



const getRequests = async (req, res) => {
    try {
        const result = await RequestService.getRequests(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}

const rejectRequest = async (req, res) => {
    try {
        const result = await RequestService.removeRequest(req.params.id, req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}




module.exports = { getRequests, rejectRequest }