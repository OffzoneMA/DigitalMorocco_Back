const UserLog = require('../models/UserLog');

const createUserLog = async (type,owner) => {
        try {
       return await UserLog.create({
        type,
        owner
       })}
       catch(err){
                throw new Error('Something went wrong !');
       }
}

const getAllUsersLogs = async (args) => {
        return await UserLog.find({
                $or: [
                        { envStatus: process.env.NODE_ENV === 'development' ? 'dev' : 'prod' },
                        { envStatus: null }
                ]
        }).sort({ dateCreated: 'desc' }).populate({ path: 'owner', select: '_id email role' }).skip(args.start ? args.start : null).limit(args.qt ? args.qt : 8);
}

const getAllUsersLogsByUser = async (userId,args) => {
        return await UserLog.find({ owner: userId, $or: [
                        { envStatus:  process.env.NODE_ENV === 'development' ? 'dev' : 'prod' },
                        { envStatus: null }
                ] }).sort({ dateCreated: 'desc' }).populate({ path: 'owner', select: '_id email role' }).skip(args.start ? args.start : null).limit(args.qt ? args.qt : 8);
}


module.exports = { createUserLog, getAllUsersLogs, getAllUsersLogsByUser }