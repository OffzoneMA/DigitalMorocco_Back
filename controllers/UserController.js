const UserService = require("../services/UserService");
const RequestService = require("../services/RequestService");
const EmailingService = require("../services/EmailingService");
const AuthService = require("../services/AuthService");
const UserLogService = require("../services/UserLogService");
const User = require('../models/User');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

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

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId || req.params.userId;
    const updatedFields = req.body;

    const user = await User.findByIdAndUpdate(userId, updatedFields, { new: true, runValidators: true });
    const log = await UserLogService.createUserLog('Profile Info Update', userId);
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserLanguageRegion = async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  try {
    const user = await UserService.updateUserLanguageRegionService(userId, updates);
    const log = await UserLogService.createUserLog('Account Language And Region Update', userId);
    res.send({ success: true, message: 'Language and region updated successfully', user });
  } catch (error) {
    if (error.message === 'User not found') {
      res.status(404).send({ success: false, message: error.message });
    } else {
      res.status(500).send({ success: false, message: 'An error occurred', error });
    }
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

const changePassword = async (req,res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
} catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
}
}

const confirmVerification = async (req, res) => {
  try {
    const result = await EmailingService.VerifyUser(req.params.token);
    const log = await UserLogService.createUserLog('Verified', result?._id);
    res.redirect(`${process.env.FRONTEND_URL}/ChooseRole`);
    // res.status(200).json(result)
  } catch (error) {
    res.status(500).json(error);
  }
};

const verifyPasswordToken = async (req, res) => {
  try {
    const result = await EmailingService.verifyResetToken(req.query.token);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const approveUser = async (req, res) => {
  try {
  
    if (req.query?.role == "investor" || req.query?.role == "member" || req.query?.role == "partner") {
      const result = await UserService.approveUserService(req.params.userId, req.query?.role);
      const emailResult = await EmailingService.sendAcceptedEmail(req.params.userId);
      const log = await UserLogService.createUserLog('Approved', req.params.userId);
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
      const result = await UserService.rejectUser(req.params.userId, req.query?.role);
      const emailResult = await EmailingService.sendRejectedEmail(req.params.userId);
      const log = await UserLogService.createUserLog('Rejected', req.params.userId);
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
    console.log(error)
    res.status(500).json(error);
  }
}

const deleteOneUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = bcrypt.compare(user.password, password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // await User.deleteOne({ _id: user._id });
    user.isDeleted = true;
    user.deletionDate = new Date();
    await user.save();

    res.status(200).json({ message: 'Account marked for deletion. You have 14 days to restore it.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
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
  const { fullName } = req.body;
  try {
      
      user = await UserService.updateFullName(req?.params?.userId , fullName);
      res.status(200).json({ message: 'Full name updated successfully', user });
  } catch (error) {
      if (error.message === 'User not found') {
          res.status(404).json({ message: error.message });
      } else {
          res.status(500).json({ message: 'Server error', error: error.message });
      }
  }
};

const sendContactEmail = async (req, res) => {

  try {
      await EmailingService.sendContactEmail(req.body?.firstName, req.body?.lastName, req.body?.email, req.body?.phone, req.body?.message);
      await EmailingService.sendContactEmailConfirm(req.body?.firstName, req.body?.lastName, req.body?.email, req.body?.message);
      res.status(200).send({message: 'Email sent successfully'});
  } catch (error) {
      console.error(error);
      res.status(500).send(error);
  }
};

module.exports = { updateUserLanguageRegion,changePassword,updateUserProfile, updateUser,addUser, approveUser, rejectUser, deleteUser, getUsers, 
  complete_signup, sendVerification, confirmVerification , sendForgotPassword , 
  resetPassword , getUserByEmail , deleteOneUser , updateFullName , sendContactEmail , verifyPasswordToken}