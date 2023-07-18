const AdminService = require('../services/AdminService');

const addAdmin= async (req, res) => {
    try {
        const result = await AdminService.createAdmin(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};






module.exports = { addAdmin }