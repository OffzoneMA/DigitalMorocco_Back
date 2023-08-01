const MemberService = require('../services/MemberService');

const addStartup = async (req, res) => {
    try {
        const result = await MemberService.CreateMember(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const getByName = async (req, res) => {
    try {
        const result = await MemberService.getMemberByName(req.params.name);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};



module.exports = { addStartup, getByName }