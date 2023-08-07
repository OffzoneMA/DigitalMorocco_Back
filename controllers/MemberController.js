const MemberService = require('../services/MemberService');
const UserLogService = require('../services/UserLogService');
const UserService = require('../services/UserService');

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

const subUser = async (req, res) => {
    try {
        const result = await MemberService.SubscribeMember(req.memberId, req.params.subid);
        const member = await MemberService.getMemberById(req.memberId);
        const log = await UserLogService.createUserLog('Account Subscribed', member.owner);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
};





module.exports = { addStartup, getByName,subUser }