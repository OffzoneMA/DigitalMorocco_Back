const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const salt = 10
const MemberService = require('../services/MemberService');
const PartnerService = require('../services/PartnerService');
const InvestorService = require('../services/InvestorService');
const ProjectService = require('../services/ProjectService');
const EventService = require('../services/EventService');
const InvestorContactService = require('../services/InvestorContactService');


const signInUser = async (u) => {
  let user = await User.findOne({ email: u.email.toLowerCase() })
    .populate('subscription') 
    .exec();

  // If no user is found with the lowercased email, search with the original email
  if (!user) {
    user = await User.findOne({ email: u.email })
      .populate('subscription') 
      .exec();
  }   
  if (user &&!user?.password){
        if(user.googleId)  { throw new Error("This email is registered through Google.");}
        if (user.linkedinId)  { throw new Error("This email is registered through Linkedin.");}
        if (user.facebookId)  { throw new Error("This email is registered through Facebook.");}
        else { throw new Error("This email is registered through another provider."); }
     }
    if (user) {

        if (user.isDeleted) {
            const deletionDate = new Date(user.deletionDate);
            const currentDate = new Date();
            const daysDifference = Math.ceil((currentDate - deletionDate) / (1000 * 60 * 60 * 24));
      
            if (daysDifference <= 14) {
              user.isDeleted = false;
              user.deletionDate = null;
              await user.save();
            } else {
              throw new Error("Account permanently deleted.");
            }
          }

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
    if (await User.findOne({ email: u.email.toLowerCase() })) {
        throw new Error('Email already exists!')
    }
    const email = u.email.toLowerCase();

    const password = u.password;
    const hashedPassword = await bcrypt.hash(password, salt)
    u.password = hashedPassword
    u.email = email;
     const user=await User.create(u)
     const accessToken = await generateAccessToken(user)
     return { accessToken: accessToken, user: user }
}

const getAllUsers = async () => {
  try {
    const users = await User.find({ isDeleted: false }).sort({ dateCreated: 'desc' });
    return users;
  } catch (error) {
    throw new Error(`Error getting list of users: ${error.message}`);
  }
}
 
const generateUserInfos = async (user) => {
    const accessToken = await generateAccessToken(user)
    let data
    let projectCount = 0;
    let eventCount = 0;
   
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

const generateUserInfosAll = async (user) => {
  const accessToken = await generateAccessToken(user);
  let roleData = {};
  let projectCount = 0;
  let eventCount = 0;
  let investmentCount = 0;

  if (user?.role?.toLowerCase() === "member") {
    const member = await MemberService.getMemberInfoByUserId(user._id);
    projectCount = await ProjectService.countProjectsByMemberId(member?._id);
    investmentCount = await InvestorContactService.countApprovedInvestments('member' ,member?._id);
    roleData = {
      ...member?._doc ? member._doc : member,
      projectCount,
      investmentCount
    };
  } else if (user?.role?.toLowerCase() === "partner") {
    const partner = await PartnerService.getPartnerByUserId(user._id);
    roleData = partner?._doc ? partner._doc : partner;
  } else if (user?.role?.toLowerCase() === "investor") {
    const investor = await InvestorService.getInvestorByUserId(user._id);
    investmentCount = await InvestorContactService.countApprovedInvestments('investor' ,investor?._id);
    roleData = {
      ...investor?._doc ? investor._doc : investor ,
      investmentCount
    }
  }

  eventCount = await EventService.countEventsByUserId(user?._id);

  // Combine user info and role-specific data into one object for easy access
  const userInfo = user?._doc ? { ...user._doc } : { ...user };
  const result = {
    ...userInfo,
    ...roleData,
    eventCount,
  };

  return { accessToken, user: result };
};

 const generateAccessToken = async (user) => {
    const payload = user?.role
  ? { user: { _id: user?._id, email: user?.email, role: user?.role } }
  : { user: { _id: user?._id, email: user?.email } };
     return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)
}


module.exports = {signInUser, createUser, generateAccessToken, generateUserInfos , generateUserInfosAll , getAllUsers}