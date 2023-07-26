const User = require('../models/User');
const Member = require('../models/Requests/Member');
const Investor = require('../models/Requests/Investor');
const Partner = require('../models/Requests/Partner');
const requestServive = require('../services/RequestService');
const FileService = require('../services/FileService');

const bcrypt = require('bcrypt');
const salt = 10

const getUsers = async (args) => {
    return await User.find().skip(args.start ? args.start : null).limit(args.qt ? args.qt : null);
}

const createUser = async (u) => {
    const password = u.password;
    const hashedPassword = await bcrypt.hash(password, salt)
    u.password = hashedPassword
    return await User.create(u)
}




const deleteUser = async (id) => {
    return await User.deleteOne({ _id: id })
}


const getUserByID = async (id) => {
    return await User.findById(id);
}

const approveUser = async (id,role) => {
    const request = await requestServive.getRequestByUserId(id, role);
    const updateRequest = { status: 'accepted' };
    if (request.rc_ice) {
        updateRequest.rc_ice = request.rc_ice;
    }
    await requestServive.removeRequestByUserId(id,role)
    return await User.findByIdAndUpdate(id, updateRequest)
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

        if (user.status =='NotVerified') {
            return res.status(403).json({ error: 'User is not verified' });
        }

        next();
    } catch (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = { createUser, getUserByID, deleteUser, approveUser, rejectUser, getUsers, checkUserVerification }
