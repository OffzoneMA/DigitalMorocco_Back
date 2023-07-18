const UserService = require("../services/UserService");
const RequestService = require("../services/RequestService");



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
    if (req.body.user?.role == "investor" || req.body.user?.role == "member" || req.body.user?.role == "partner" ){
    const result = await UserService.createUser(req.body.user);
    const signupRequest = await RequestService.createRequest(req.body.request, result._id, req.body.user?.role);
    res.status(200).json(result);}
    else{
      res.status(400).json({ error: "Missing role" });
    }
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




module.exports = { addUser, approveUser, rejectUser, deleteUser, getUsers }