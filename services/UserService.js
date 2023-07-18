const User = require('../models/User');
const Member = require('../models/Requests/Member');
const Investor = require('../models/Requests/Investor');
const Partner = require('../models/Requests/Partner');
const requestServive = require('../services/RequestService');

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
    await requestServive.removeRequestByUserId(id,role)
    return await User.findByIdAndUpdate(id, { approved: 'accepted' })
}

const rejectUser = async (id, role) => {
    await requestServive.removeRequestByUserId(id, role)
    return await User.findByIdAndUpdate(id, { approved: 'rejected' })
}



module.exports = { createUser, getUserByID, deleteUser, approveUser, rejectUser, getUsers }
