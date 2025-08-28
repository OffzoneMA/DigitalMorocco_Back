const Member = require('../models/Requests/Member');
const Investor = require('../models/Requests/Investor');
const Partner = require('../models/Requests/Partner');
const User = require('../models/User');

const uploadService = require('./FileService')


// const createRequest = async (data, id, role,file) => {
//     if (role === "investor") {
//         return await Investor.create({ linkedin_link: data?.linkedin_link, user: id })
//             .then(async(res) => await User.findByIdAndUpdate(id, {status:'pending',role}))
//     }
//     else if (role === "partner") {
//         return await Partner.create({ num_rc: data?.num_rc, user: id })
//             .then(async (res) => await User.findByIdAndUpdate(id, { status: 'pending', role }))
//     }
//     else if (role === "member") {
//        if (!file) {    
//            throw new Error( 'File required' );
//         }
//      return  await Member.create({user: id }).then(async(member)=>{
//             const fileLink = await uploadService.uploadFile(file, "Members/" + id + "", "rc_ice")
//          await Member.findByIdAndUpdate(member._id, { rc_ice: fileLink })
//              .then(async (res) => {
//                 await User.findByIdAndUpdate(id, { status: 'pending', role })})
//         })
//     }
// }

const createRequest = async (data, id, role, file) => {
  if (role === "investor") {
    await Investor.create({ linkedin_link: data?.linkedin_link, user: id });
    return await User.findByIdAndUpdate(id, { status: 'pending', role });
  } 
  else if (role === "partner") {
    await Partner.create({ num_rc: data?.num_rc, user: id });
    return await User.findByIdAndUpdate(id, { status: 'pending', role });
  } 
  else if (role === "member") {
    if (!file) throw new Error('File required');

    const member = await Member.create({ user: id });
    const fileLink = await uploadService.uploadFile(file, `Members/${id}`, 'rc_ice');
    await Member.findByIdAndUpdate(member._id, { rc_ice: fileLink });
    return await User.findByIdAndUpdate(id, { status: 'pending', role });
  } 
  else {
    throw new Error('Invalid role');
  }
};

const createRequestTest = async (data, id, role) => {
    if (role === "investor") {
        return await Investor.create({user: id })
            .then(async(res) => await User.findByIdAndUpdate(id, {status:'pending',role}))
    }
    else if (role === "partner") {
        return await Partner.create({ user: id })
            .then(async (res) => await User.findByIdAndUpdate(id, { status: 'pending', role }))
    }
    else if (role === "member") {
     return  await Member.create({user: id })
             .then(async (res) => {
                await User.findByIdAndUpdate(id, { status: 'pending', role })})
    }
}



const getRequests = async (args) => {
    if (args.type === "investor") {
        return await Investor.find().populate({ path: 'user', select: 'email' }).skip(args.start ? args.start : 0).limit(args.qt ? args.qt : 8);
    }
    else if (args.type === "partner") {
        return await Partner.find().populate({ path: 'user', select: 'email' }).skip(args.start ? args.start : 0).limit(args.qt ? args.qt : 8);
    }
    else if (args.type === "member") {
        return await Member.find().populate({ path: 'user', select: 'email' }).skip(args.start ? args.start : 0).limit(args.qt ? args.qt : 8);
    }
}


const getRequestByUserId = async (userId, role) => {
    if (role === "investor") {
        return await Investor.findOne({ user: userId })
    }
    else if (role === "partner") {
        return await Partner.findOne({ user: userId })
    }
    else if (role === "member") {
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


module.exports = { getRequests, removeRequest, getRequestByUserId, removeRequestByUserId, createRequest ,
createRequestTest}

