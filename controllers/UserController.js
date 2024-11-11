const UserService = require("../services/UserService");
const RequestService = require("../services/RequestService");
const EmailingService = require("../services/EmailingService");
const AuthService = require("../services/AuthService");
const UserLogService = require("../services/UserLogService");
const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const NewsletterService = require('../services/NewsletterService');
const TokenShortCode = require('../models/TokenShortCode')
const ActivityHistoryService = require('../services/ActivityHistoryService');

const languages = [
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'French' },
  { id: 'fr', label: 'Français' },
  { id: 'es', label: 'Spanish' },
  { id: 'de', label: 'German' },
  { id: 'it', label: 'Italian' },
  { id: 'pt', label: 'Portuguese' },
  { id: 'ru', label: 'Russian' },
  { id: 'zh', label: 'Chinese' },
  { id: 'ja', label: 'Japanese' },
  { id: 'ko', label: 'Korean' },
  { id: 'ar', label: 'Arabic' },
  { id: 'hi', label: 'Hindi' },
  { id: 'tr', label: 'Turkish' },
  { id: 'nl', label: 'Dutch' },
  { id: 'pl', label: 'Polish' },
  { id: 'sv', label: 'Swedish' },
  { id: 'fi', label: 'Finnish' },
  { id: 'da', label: 'Danish' },
  { id: 'no', label: 'Norwegian' },
  { id: 'el', label: 'Greek' },
];

function getLanguageIdByLabel(label) {
  const language = languages.find(lang => lang.label === label);
  return language ? language.id : null;
}

const getUsers = async (req, res) => {
  try {
    const result = await UserService.getUsers(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
}

const getAllUsers = async (req, res) => {
  let { page = 1, limit = 10, roles = '', statuses = '' } = req.query;

  const rolesArray = roles ? roles.split(',') : [];
  const statusesArray = statuses ? statuses.split(',') : [];

  try {
    const response = await AuthService.getAllUsersPage(
      parseInt(page), 
      parseInt(limit), 
      rolesArray, 
      statusesArray
    );

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



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
    const file = req.file;
    const user = await UserService.updateUserProfile(userId, updatedFields, file);
    if (user) {
      await UserLogService.createUserLog('Profile Info Update', userId);
      await ActivityHistoryService.createActivityHistory(
        userId,
        'profile_updated',
        { targetName: 'User Profile', targetDesc: `User profile updated for userId ${userId}` }
      );
      res.json({ message: 'Profile updated successfully', user });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
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
    if(req.body?.offers) {
      const newLetterResult = await NewsletterService.subscribe(req.body?.email);
    }
    const emailresult = await EmailingService.sendVerificationEmail(result.user._id , getLanguageIdByLabel(req.body?.language)); 
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
        res.status(404).json({ message: 'User not found for this e-mail.' });
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
    if (user && user?.role) {
      res.status(400).json({ message: "Already has a Role!" });
    }
    else if (user && !user?.role){
     if (data?.role == "investor" || data?.role == "member" || data?.role == "partner") {
     //  const request= await RequestService.createRequest(data, userId, data?.role, file);
     const request = await RequestService.createRequestTest(data, userId , data?.role)
     const result = await EmailingService.sendUnderReviewEmail(userId , data?.language);
     const log = await UserLogService.createUserLog('Account Under Review', userId);
      res.status(200).json(request);
     }
      else {
        res.status(400).json({ message: "Missing role" });
      }
    }
    else {
        res.status(400).json({ message: "Missing User Id" });
    }

  } catch (error) {
    res.status(500).json(error);
  }
};

const sendVerification = async (req, res) => {
  try {
    const result = await EmailingService.sendVerificationEmail(req.params.userid , req.query?.lang);
    res.status(200).json(result);
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};

const sendForgotPassword = async (req, res) => {
  try {
    const { email  , lang } = req.body;
    const user = await UserService.getUserByEmail(email);

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    const result = await EmailingService.sendForgotPasswordEmail(user._id , lang);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const resetPassword = async (req , res) => {
  try {
    const { token, password, confirmPassword , language} = req.body;

    const result = await UserService.resetPassword(token, password , confirmPassword , language);
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
    await UserLogService.createUserLog('Password Change', userId);
    await ActivityHistoryService.createActivityHistory(
      userId,
      'password_changed',
      { targetName: 'User Password', targetDesc: `User password changed for userId ${userId}` }
    );
    res.status(200).json({ success: true, user: user });
} catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
}
}

const confirmVerification = async (req, res) => {
  try {
    const result = await EmailingService.VerifyUser(req.params.token);
    const log = await UserLogService.createUserLog('Verified', result?._id);
    res.redirect(`${process.env.FRONTEND_URL}/SuccessSignUp?user_id=${result?._id}&redirectFromVerify=${true}&lang=${req?.query?.lang}`);
    // res.status(200).json(result)
  } catch (error) {
    console.error(error);
    // In case of an expired token, retrieve the user information
    const tokenEntry = await TokenShortCode.findOne({ _id: req.params.token, used: false });
    const user = await User.findById(tokenEntry?.userId);
    if (user) {
      // Redirect to a page to request a new verification link
      res.redirect(`${process.env.FRONTEND_URL}/VerifyFailure?err=${error?.message}&user_id=${user._id}&email=${user.email}&lang=${req?.query?.lang}`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/VerifyFailure?err=${error?.message}&lang=${req?.query?.lang}`);

    }
  }
};

const verifyPasswordToken = async (req, res) => {
  try {
    const result = await EmailingService.verifyResetToken(req.query.token);
    // If the token is valid, redirect to the reset password page
    res.redirect(`${process.env.FRONTEND_URL}/ResetPassword?token=${req.query.token}&lang=${req?.query?.lang}`);
  } catch (error) {
    console.error('Error verifying token:', error.message);
    // Redirect to the sign-in page with an error message if the token is invalid or expired
    res.redirect(`${process.env.FRONTEND_URL}/SignIn?error=${encodeURIComponent(error.message)}`);
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
    const log = await UserLogService.createUserLog('Account Delete', req.params.id);
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

    const isMatch = await bcrypt.compare(password, user.password); 

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

const deleteOneOfUser = async (req, res) => {

  try {
    const user = await User.findById(req.params?.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
  const { fullName , image , language } = req.body;
  try {
      const user = await UserService.updateFullName(req?.params?.userId , fullName , image , language);
      res.status(200).json({ message: 'Full name updated successfully', user });
  } catch (error) {
      if (error.message === 'User not found') {
          res.status(404).json({ message: error.message });
      } else {
          res.status(500).json({ message: 'Server error', error: error });
      }
  }
};

const sendContactEmail = async (req, res) => {

  try {
      await EmailingService.sendContactEmail(req.body?.firstName, req.body?.lastName, req.body?.email, req.body?.phone, req.body?.message);
      await EmailingService.sendContactEmailConfirm(req.body?.firstName, req.body?.lastName, req.body?.email, req.body?.message , req.body?.language);
      res.status(200).send({message: 'Email sent successfully'});
  } catch (error) {
      res.status(500).send({message: error.message});
  }
};

const getUserByID = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getUsersCountByMonth = async (req, res) => {
  try {
      const result = await UserService.countUsersByMonth();
      res.status(200).json(result);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

const getDistinctFieldValues = async (req, res) => {
  const { field } = req.query;

  if (!field) {
    return res.status(400).json({ error: '"field" parameter is required' });
  }

  try {
    const values = await UserService.getDistinctValues(field);
    res.status(200).json({ field, values });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { updateUserLanguageRegion,changePassword,updateUserProfile, updateUser,addUser, approveUser, rejectUser, deleteUser, getUsers, 
  complete_signup, sendVerification, confirmVerification , sendForgotPassword , deleteOneOfUser ,
  resetPassword , getUserByEmail , deleteOneUser , updateFullName , sendContactEmail , verifyPasswordToken , 
getUserByID , getUsersCountByMonth , getAllUsers , getDistinctFieldValues
}