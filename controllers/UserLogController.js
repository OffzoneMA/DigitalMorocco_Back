const UserLogService = require("../services/UserLogService");



const getAllLogs= async (req, res) => {
    try {
        const result = await UserLogService.getAllUsersLogs(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}



module.exports = { getAllLogs }