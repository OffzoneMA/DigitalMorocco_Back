const AuthService = require("../services/AuthService");

const addUser = async (req, res) => {
  try {
    const result = await AuthService.createUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};
module.exports = { addUser}