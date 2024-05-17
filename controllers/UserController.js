const UserService = require("../services/UserService");
const RequestService = require("../services/RequestService");
const EmailingService = require("../services/EmailingService");
const AuthService = require("../services/AuthService");
const UserLogService = require("../services/UserLogService");

const getUsers = async (req, res) => {
  try {
    const result = await UserService.getUsers(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
}
const updateUser = async (req, res) => {
  try {
  const result = await UserService.updateUser(req.userId, req.body);
    const log = await UserLogService.createUserLog('Account Update', req.userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
}

const addUser = async (req, res) => {
  try { 
    const result = await AuthService.createUser(req.body);
    const log = await UserLogService.createUserLog('Account Initial Signup', result.user._id);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message }); 
   }
};

const getUserByEmail = async (req , res) => {
  try {
    const user = await UserService.getUserByEmail(req.params.email);
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: 'Use not found for this e-mail.' });
    }
} catch (error) {
    res.status(500).json({ message:  error.message });
}
}

const complete_signup = async (req, res) => {
  try {
    let userId = req.params.userid
    let file = req?.file ? req?.file : null
    let data = isJsonString(req?.body) ? JSON.parse(req?.body) : req?.body
    const user = await UserService.getUserByID(userId)
    if (user && user?.role) res.status(400).json({ message: "Already has a Role!" });
    if (user && !user?.role){
     if (data?.role == "investor" || data?.role == "member" || data?.role == "partner") {
    //  const request= await RequestService.createRequest(data, userId, data?.role, file);
    const request = await RequestService.createRequestTest(data, userId , data?.role)
     const result = await EmailingService.sendUnderReviewEmail(userId);
     const log = await UserLogService.createUserLog('Account Under Review', userId);
      res.status(200).json(request);
    }
    else {
      res.status(400).json({ message: "Missing role" });
    }}
    else {
      res.status(400).json({ message: "Missing User Id" });
    }

  } catch (error) {
    res.status(500).json(error);
  }
};


const sendVerification = async (req, res) => {
  try {
    const result = await EmailingService.sendVerificationEmail(req.params.userid);
    res.status(200).json(result);
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};

const sendForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserService.getUserByEmail(email);

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    const result = await EmailingService.sendForgotPasswordEmail(user._id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const resetPassword = async (req , res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    const result = await UserService.resetPassword(token, password , confirmPassword);
    res.status(200).json(result);

  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
}

const confirmVerification = async (req, res) => {
  try {
    const result = await EmailingService.VerifyUser(req.params.userid,req.query.token);
    const log = await UserLogService.createUserLog('Verified', req.params.userid);
    res.redirect(`${process.env.FRONTEND_URL}/ChooseRole`);
  } catch (error) {
    res.status(500).json(error);
  }
};

const approveUser = async (req, res) => {
  try {
    if (req.query?.role == "investor" || req.query?.role == "member" || req.query?.role == "partner") {
      const result = await UserService.approveUser(req.params.id, req.query?.role);
      const emailResult = await EmailingService.sendAcceptedEmail(req.params.id);
      const log = await UserLogService.createUserLog('Approved', req.params.id);
      res.status(200).json(result);
    }
    else {
      res.status(400).json({ message: "Missing role" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message }); 
  }
};

const rejectUser = async (req, res) => {
  try {
    if (req.query?.role == "investor" || req.query?.role == "member" || req.query?.role == "partner") {
      const result = await UserService.rejectUser(req.params.id, req.query?.role);
      const emailResult = await EmailingService.sendRejectedEmail(req.params.id);
      const log = await UserLogService.createUserLog('Rejected', req.params.id);
    res.status(200).json(result);
  }
    else {
      res.status(400).json({ message: "Missing role " });
}
  } catch (error) {
    res.status(400).json({ message: error.message }); 
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await UserService.deleteUser(req?.userId);
    //const log = await UserLogService.createUserLog('Account Delete', req.params.id);
    res.status(204).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
}

const deleteOneUser = async (req, res) => {
  try {
    const result = await UserService.deleteUser(req?.params?.userId);
    res.status(204).json(result);
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

const updateFullName = async (req, res) => {
  const { fullName, socialId, socialType } = req.body;
  try {
      
      user = await UserService.updateFullName(socialId , socialType , fullName);
      
      res.status(200).json({ message: 'Full name updated successfully', user });
  } catch (error) {
      if (error.message === 'User not found') {
          res.status(404).json({ message: error.message });
      } else {
          res.status(500).json({ message: 'Server error', error: error.message });
      }
  }
};

module.exports = { updateUser,addUser, approveUser, rejectUser, deleteUser, getUsers, 
  complete_signup, sendVerification, confirmVerification , sendForgotPassword , 
  resetPassword , getUserByEmail , deleteOneUser , updateFullName}