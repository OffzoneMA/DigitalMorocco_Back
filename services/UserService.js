const User = require('../models/User');
const MemberService = require('../services/MemberService');
const PartnerService = require('../services/PartnerService');
const InvestorService = require('../services/InvestorService');
const requestServive = require('../services/RequestService');
const FileService = require('../services/FileService');
const bcrypt = require('bcrypt');
const salt=10


const getUsers = async (args) => {
    return await User.find().skip(args.start ? args.start : null).limit(args.qt ? args.qt : null);
}

const deleteUser = async (id) => {
    return await User.deleteOne({ _id: id })
}

const updateUser = async (userId,user) => {
    if (user.password){
        const password = user.password;
        const hashedPassword = await bcrypt.hash(password, salt)
        user.password = hashedPassword
    }
    return await User.findByIdAndUpdate(userId, user)
}


const getUserByID = async (id) => {
    return await User.findById(id);
}


const approveUser = async (id,role) => {
    if (!(await User.findById(id))) {
        throw new Error('User doesn t exist !')
    }
    const request = await requestServive.getRequestByUserId(id, role);
    if (!request) {
        throw new Error('Request not found!');
    }

    role == "member" && await MemberService.CreateMember({ owner: id, rc_ice: request?.rc_ice })
    role == "partner" && await PartnerService.CreatePartner({ owner: id, num_rc: request?.num_rc })
    role == "investor" && await InvestorService.CreateInvestor({ owner: id, linkedin_link: request?.linkedin_link })
    await requestServive.removeRequestByUserId(id,role)
    return await User.findByIdAndUpdate(id, { status: 'accepted' })
}

const rejectUser = async (id, role) => {
    const request = await requestServive.getRequestByUserId(id, role);
    if (request.rc_ice) {
        await FileService.deleteFile("rc_ice", "Members/" + id);
    }
    await requestServive.removeRequestByUserId(id, role)
    return await User.findByIdAndUpdate(id, { status: 'rejected' })
}

async function checkUserVerification(req, res, next) {
    const userId = req.params.userid;

    try {
        const user = await User.findById(userId); 

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.status =='notVerified') {
            return res.status(403).json({ error: 'User is not verified' });
        }

        next();
    } catch (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = {  getUserByID, deleteUser, approveUser, rejectUser, getUsers, checkUserVerification, updateUser }
