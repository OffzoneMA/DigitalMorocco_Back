const UserService=require('../services/UserService');
const jwt=require("jsonwebtoken")
const MemberService = require('../services/MemberService');
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
      let role
      role = u.role == "member" && await MemberService.getMemberByUserId(u._id)
      const result = { ...u._doc, "member": role }
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
  login, authenticateToken, userInfo, AuthenticateAdmin, AuthenticateMember
}