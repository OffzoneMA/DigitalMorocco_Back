const User = require('../models/User');
const Member = require('../models/Requests/Member');
const Investor = require('../models/Requests/Investor');
const Partner = require('../models/Requests/Partner');
const bcrypt = require('bcrypt');
const salt = 10


const createUser = async (u) => {
    const password = u.password;
    const hashedPassword = await bcrypt.hash(password, salt)
    u.password = hashedPassword
    return await User.create(u)
}

const createMemberRequest = async (request) => {
    return await Member.create(request)
}

const createPartnerRequest = async (request) => {
    return await Partner.create(request)
}

const createInvestorRequest = async (request) => {
    return await Investor.create(request)
}

const deleteUser = async (id) => {
    return await User.deleteOne({ _id: id })
}


const getUserByID = async (id) => {
    return await User.findById(id);
}

const approveUser = async (id) => {
    return await User.findByIdAndUpdate(id, { approved: 'accepted' })
}

const rejectUser = async (id) => {
    return await deleteUser(id)
}



module.exports = { createUser, getUserByID, deleteUser, approveUser, rejectUser }
