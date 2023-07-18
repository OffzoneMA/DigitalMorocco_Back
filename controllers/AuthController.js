const UserService=require('../services/UserService');
const jwt=require("jsonwebtoken")

const AuthService=require('../services/AuthService');



const login=async(req,res)=>{
    try{ 
      const user = await AuthService.signInUser(req.body)
        res.status(200).json(user)
    }catch(error){
      res.status(404).json({ error: "Sign In failed" })
    }

}

const userInfo=async(req,res)=>{
  try{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return  res.status(200).json(null)
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => { 
      const result = await UserService.getUserByID(user.user._id);
      res.status(200).json(result)
    })
  }catch(error){
    res.status(404).json({ error: "No user found" })
  }

}
const authenticateToken=async(req,res,next)=>{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => { 
      if (err) return res.status(401).json({ error: "Invalid or expired token." });
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

module.exports={
  login, authenticateToken, userInfo, AuthenticateAdmin
}