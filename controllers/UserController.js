const UserService = require("../services/UserService");
const RequestService = require("../services/RequestService");
const EmailVerificationService = require("../services/EmailVerification");



const getUsers = async (req, res) => {
  try {
    const result = await UserService.getUsers(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
}

const addUser = async (req, res) => {
  try { 
    const result = await UserService.createUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const complete_signup = async (req, res) => {
  try {
    let userId = req.params.userid
    let file = req?.file ? req?.file : null
    let data = isJsonString(req.body) ? JSON.parse(req.body) : req.body
    if (data?.role == "investor" || data?.role == "member" || data?.role == "partner") {
     const request= await RequestService.createRequest(data, userId, data?.role, file);
      res.status(200).json(request);
    }
    else {
      res.status(400).json({ error: "Missing role" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};


const sendVerification = async (req, res) => {
  try {
    const result = await EmailVerificationService.sendVerificationEmail(req.params.userid);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const confirmVerification = async (req, res) => {
  try {
    const result = await EmailVerificationService.VerifyUser(req.params.userid);
    res.redirect(`${process.env.FRONTEND_URL}/user_verified`);
  } catch (error) {
    res.status(500).json(error);
  }
};



const approveUser = async (req, res) => {
  try {
    if (req.query?.role == "investor" || req.query?.role == "member" || req.query?.role == "partner") {
      const result = await UserService.approveUser(req.params.id, req.query?.role);
      res.status(200).json(result);
    }
    else {
      res.status(400).json({ error: "Missing role" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const rejectUser = async (req, res) => {
  try {
    if (req.query?.role == "investor" || req.query?.role == "member" || req.query?.role == "partner") {
      const result = await UserService.rejectUser(req.params.id, req.query?.role);
    res.status(200).json(result);
  }
    else {
  res.status(400).json({ error: "Missing role " });
}
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await UserService.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
}


function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

module.exports = { addUser, approveUser, rejectUser, deleteUser, getUsers, complete_signup, sendVerification, confirmVerification }