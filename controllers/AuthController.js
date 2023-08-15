const UserService=require('../services/UserService');
const jwt=require("jsonwebtoken")
const MemberService = require('../services/MemberService');
const ProjectService = require('../services/ProjectService');
const AuthService = require('../services/AuthService');
const UserLogService =require('../services/UserLogService');



const login=async(req,res)=>{
    try{ 
      const user = await AuthService.signInUser(req.body)
      const log = await UserLogService.createUserLog('Account Signin', user.user._id);
        res.status(200).json(user)
    }catch(error){
      res.status(404).json({ message: error.message})
    }

}

const userInfo=async(req,res)=>{
  try{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return  res.status(200).json(null)
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => { 
      const u = await UserService.getUserByID(user?.user?._id);

      let data

      if (u?.role == "member") {
        let member = await MemberService.getMemberByUserId(u._id)
        data = member?._doc ? member?._doc :member
        if (member?.companyName) {
          let project = await ProjectService.getProjectByMemberId(member._id)
          if (project) data={...data,"project":project}
        }
      }
      const result = u?._doc ? { ...u._doc, [u?.role]: data } : { ...u, [u?.role]: data }
      res.status(200).json(result)
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

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    if (user.user.role == "Admin") {
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

const AuthenticateMember = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) {return res.sendStatus(403)}
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

module.exports={
  login, authenticateToken, userInfo, AuthenticateAdmin, AuthenticateMember, AuthenticateUser
}