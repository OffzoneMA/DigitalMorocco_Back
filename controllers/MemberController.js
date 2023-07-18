const MemberService = require('../services/MemberService');

const addMember = async (req, res) => {
    try {
        const result = await MemberService.CreateMember(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};





module.exports = { addMember }