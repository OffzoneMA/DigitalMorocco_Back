const UserService=require('../services/UserService');
const jwt=require("jsonwebtoken")
const MemberService = require('../services/MemberService');
const PartnerService = require('../services/PartnerService');
const InvestorService = require('../services/InvestorService');
const ProjectService = require('../services/ProjectService');
const AuthService = require('../services/AuthService');
const UserLogService =require('../services/UserLogService');
const SusbcriptionService = require('../services/SubscriptionService');


const login=async(req,res)=>{
    try{ 
      const user = await AuthService.signInUser(req.body)
      const log = await UserLogService.createUserLog('Account Signin', user.user._id);
        res.status(200).json(user)
    }catch(error){
      console.log(error)
      res.status(404).json({ message: error.message})
    }

}

const AllUsers=async(req,res)=>{
  try{ 
      const user=await AuthService.getAllUsers()
      res.status(200).json(user)
  }catch(error){
    res.status(500).json(error.message)
  }
}

const userInfo=async(req,res)=>{
  try{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return  res.status(200).json(null)
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => { 
      const u = await UserService.getUserByID(user?.user?._id);
      const result= await AuthService.generateUserInfosAll(u)
      res.status(200).json(result?.user? result?.user : u)
    })
  }catch(error){
    res.status(404).json({ message: "No user found" })
  }
}

const authenticateToken=async(req,res,next)=>{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => { 
      if (err) return res.status(401).json({ message: "Invalid or expired token." });
      req.user = user.user
      next()
    })
  
}

const AuthenticateAdmin = async (req, res, next) => {

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    if (user?.user?.role === "Admin") {
      next()
    }
    else {
      return res.sendStatus(403)
    }

  })
}

const AuthenticateUser = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, u) => {
    if (err) { return res.sendStatus(403) }
    const user = await UserService.getUserByID(u?.user?._id)
    if (user) {
      req.userId = user._id
      next()
    }
    else {
      return res.sendStatus(403)
    }

  })
}
const AuthenticateUserOrAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, u) => {
    if (err) { return res.sendStatus(403) }
    if (user?.user?.role === "Admin") {
      next()
    }
    const user = await UserService.getUserByID(u?.user?._id)
    if (user) {
      req.userId = user._id
      next()
    }
    else {
      return res.sendStatus(403)
    }

  })
}

const AuthenticateMember = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) { return res.sendStatus(403) }
    const userMember = await UserService.getUserByID(user?.user?._id)
    const member = await MemberService.getMemberByUserId(userMember?._id)

    if (member) {

      req.memberId = member._id
      next()
    }
    else {
      return res.sendStatus(403)
    }

  })
}
const AuthenticateInvestor = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) { return res.sendStatus(403) }
    const userInvestor = await UserService.getUserByID(user?.user?._id)
    const investor = await InvestorService.getInvestorByUserId(userInvestor?._id)

    if (investor) {
      req.investorId = investor._id
      next()
    }
    else {
      return res.sendStatus(403)
    }

  })
}

const AuthenticateSubMember = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) { return res.sendStatus(403) }
    const userMember = await UserService.getUserByID(user?.user?._id)
    const subscription = await SusbcriptionService.getSubscriptionsByUser(userMember?._id)

    if (subscription && subscription.subscriptionStatus ==="active") {
      req.userId = subscription.user
      next()
    }
    else {
      return res.sendStatus(403)
    }

  })
}

const AuthenticatePartner = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) { return res.sendStatus(403) }
    const userPartner = await UserService.getUserByID(user?.user?._id)
    const partner = await PartnerService.getPartnerByUserId(userPartner?._id)

    if (partner) {
      req.partnerId = partner._id
      next()
    }
    else {
      return res.sendStatus(403)
    }

  })
}


const AuthenticateSubMemberOrAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) { return res.sendStatus(403) }
    if (user?.user?.role === "Admin") {
      next()
    }
    const userMember = await UserService.getUserByID(user?.user?._id)
    const subscription = await SusbcriptionService.getSubscriptionsByUser(userMember?._id)

    if (subscription && subscription.subscriptionStatus === "active") {
      req.userId = subscription.user
      next()
    }
    else {
      return res.sendStatus(403)
    }

  })
}

module.exports = { 
  AuthenticateUserOrAdmin, AllUsers,
  AuthenticateInvestor, AuthenticateSubMemberOrAdmin, AuthenticateSubMember, 
  login, authenticateToken, userInfo, AuthenticateAdmin, AuthenticateMember, 
  AuthenticateUser, AuthenticatePartner, 
}