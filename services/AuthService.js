const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const salt = 10
const MemberService = require('../services/MemberService');
const PartnerService = require('../services/PartnerService');
const InvestorService = require('../services/InvestorService');
const ProjectService = require('../services/ProjectService');
const EventService = require('../services/EventService');




const signInUser = async (u) => {
    const user = await User.findOne({ email: u.email });
    if (user &&!user?.password){
        if(user.googleId)  { throw new Error("This email is registered through Google.");}
        if (user.linkedinId)  { throw new Error("This email is registered through Linkedin.");}
        if (user.facebookId)  { throw new Error("This email is registered through Facebook.");}
        else { throw new Error("This email is registered through another provider."); }
     }
    if (user) {
        const cmp = await bcrypt.compare(u.password, user.password);
        if (cmp) {
          const result= await generateUserInfos(user)
            return result
        } else {
            throw new Error('Wrong password !');
        }
    } else {
        throw new Error("Wrong email .");
    }
}

const createUser = async (u) => {
    if (await User.findOne({ email: u.email })) {
        throw new Error('Email already exists!')
    }
    const password = u.password;
    const hashedPassword = await bcrypt.hash(password, salt)
    u.password = hashedPassword
     const user=await User.create(u)
     const accessToken = await generateAccessToken(user)
     return { accessToken: accessToken, user: user }
}

const getAllUsers= async()=> {
    try {
      const users = await User.find();
      return users;
    } catch (error) {
      throw new Error(`Error getting list of users : ${error.message}`);
    }
  }
 
const generateUserInfos = async (user) => {
    const accessToken = await generateAccessToken(user)
    let data
    let projectCount;
    let eventCount;
   
    if (user?.role?.toLowerCase() == "member"){
        let member = await MemberService.getMemberByUserId(user._id)
        projectCount = await ProjectService.countProjectsByMemberId(member?._id);
        data = {
            ...member?._doc ? member._doc : member,
            projectCount
        };

    }
    if (user?.role?.toLowerCase() == "partner") {
        let partner = await PartnerService.getPartnerByUserId(user._id)
        data = partner?._doc ? partner?._doc : partner
    }
    if (user?.role?.toLowerCase() == "investor") {
        let investor = await InvestorService.getInvestorByUserId(user._id)
        data = investor?._doc ? investor?._doc : investor
    }

    eventCount = await EventService.countEventsByUserId(user?._id);
    const result = user?._doc 
    ? { ...user._doc, [user?.role?.toLowerCase()]: data, eventCount } 
    : { ...user, [user?.role?.toLowerCase()]: data, eventCount };    
    
    return { accessToken: accessToken, user: result }
}

 const generateAccessToken = async (user) => {
    const payload = user?.role
  ? { user: { _id: user?._id, email: user?.email, role: user?.role } }
  : { user: { _id: user?._id, email: user?.email } };
     return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)
}


module.exports = {signInUser, createUser, generateAccessToken, generateUserInfos , getAllUsers}