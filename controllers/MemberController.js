const MemberService = require('../services/MemberService');
const UserLogService = require('../services/UserLogService');
const UserService = require('../services/UserService');

const createEnterprise = async (req, res) => {
    try {
        let data = isJsonString(req?.body.infos) ? JSON.parse(req?.body.infos) : req?.body.infos
        const result = await MemberService.createEnterprise(req.memberId, data, req?.files.files, req?.files.logo);
        const member = await MemberService.getMemberById(req.memberId);
        const log = await UserLogService.createUserLog('Enterprise Edited', member.owner);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
};

const createProject= async (req, res) => {
    try {
        const result = await MemberService.createProject(req.memberId, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getByName = async (req, res) => {
    try {
        const result = await MemberService.getMemberByName(req.params.name);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message }); 
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

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}



module.exports = { createEnterprise, getByName,subUser }
