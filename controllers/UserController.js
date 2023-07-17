const UserService = require("../services/UserService");

const addUser = async (req, res) => {
  try {
    const result = await UserService.createUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};


const approveUser = async (req, res) => {
  try {
    const result = await UserService.approveUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const rejectUser = async (req, res) => {
  try {
    const result = await UserService.rejectUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};





module.exports = { addUser, approveUser, rejectUser }