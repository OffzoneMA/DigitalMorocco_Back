const Member = require('../models/Requests/Member');
const Investor = require('../models/Requests/Investor');
const Partner = require('../models/Requests/Partner');
const UserService = require('../services/UserService');


const createRequest = async (data, id, role) => {
    const request = { ...data, user: id }
    if (role == "investor") {
        return await Investor.create(request)
    }
    else if (role == "partner") {
        return await Partner.create(request)
    }
    else if (role == "member") {
        return await Member.create(request)
    }
}



const getRequests = async (args) => {
    if (args.type == "investor") {
        return await Investor.find().skip(args.start ? args.start : null).limit(args.qt ? args.qt : null);
    }
    else if (args.type == "partner") {
        return await Partner.find().skip(args.start ? args.start : null).limit(args.qt ? args.qt : null);
    }
    else if (args.type == "member") {
        return await Member.find().skip(args.start ? args.start : null).limit(args.qt ? args.qt : null);
    }
}


const getRequestByUserId = async (userId, type) => {
    if (type == "investor") {
        return await Investor.findOne({ user: userId })
    }
    else if (type == "partner") {
        return await Partner.findOne({ user: userId })
    }
    else if (type == "member") {
        return await Member.findOne({ user: userId })
    }

}


const removeRequest = async (id,type) => {
    if (type == "investor") {
        return await Investor.deleteOne({ _id: id })
    }
    else if (type== "partner") {
        return await Partner.deleteOne({ _id: id })
    }
    else if (type== "member") {
        return await Member.deleteOne({ _id: id })
    }
}


const removeRequestByUserId = async (userId, type) => {
    if (type == "investor") {
        return await Investor.deleteOne({ user: userId })
    }
    else if (type == "partner") {
        return await Partner.deleteOne({ user: userId })
    }
    else if (type == "member") {
        return await Member.deleteOne({ user: userId })
    }
}


module.exports = { getRequests, removeRequest, getRequestByUserId, removeRequestByUserId, createRequest }

