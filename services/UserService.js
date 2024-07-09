const User = require('../models/User');
const MemberService = require('../services/MemberService');
const PartnerService = require('../services/PartnerService');
const InvestorService = require('../services/InvestorService');
const requestServive = require('../services/RequestService');
const FileService = require('../services/FileService');
const EmailingService = require('../services/EmailingService');
const bcrypt = require('bcrypt');
const UserLog = require('../models/UserLog');
const salt=10

const languages = [
    { id: 'en', label: 'English' },
    { id: 'fr', label: 'French' },
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

  const getLanguageLabelById = (id) => {
    const language = languages.find(lang => lang.id === id);
    return language ? language.label : null;
  };

const getUsers = async (args) => {
    return await User.find().skip(args.start ? args.start : null).limit(args.qt ? args.qt : null);
}

const deleteUser = async (id) => {
    const user=await User.findById(id)
    if (user?.role == "investor") await InvestorService.deleteInvestor(id)
    if (user?.role == "member") await MemberService.deleteMember(id)
    if (user?.role == "partner") await PartnerService.deletePartner(id)
     await UserLog.deleteMany({ owner: id })
     return await User.deleteOne({ _id: id })
}

const updateUser = async (userId,user) => {
    if (user.password){
        const password = user.password;
        const hashedPassword = await bcrypt.hash(password, salt)
        user.password = hashedPassword
    }
    return await User.findByIdAndUpdate(userId, user)
}

const updateUserLanguageRegionService = async(userId, updates) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
  
    if (updates.language) {
        user.language = updates.language;
    }
    
    if (updates.region) {
        user.region = updates.region;
    }
  
    await user.save();
  
    return user;
}

const getUserByID = async (id) => {
    return await User.findById(id);
}

const getUserByEmail = async (email) => {
    return await User.findOne({ email });
}


const approveUserService = async (userId,role) => {
    
    if (!(await User.findById(userId))) {
        throw new Error('User doesn t exist !')
    }
    
    const request = await requestServive.getRequestByUserId(userId, role);
     
    if (!request) {
        throw new Error('Request not found!');
    }

    role == "member" && await MemberService.CreateMember(userId, {rc_ice: request?.rc_ice} )
    role == "partner" && await PartnerService.CreatePartner({ owner: userId, num_rc: request?.num_rc })
    role == "investor" && await InvestorService.CreateInvestor({ owner: userId, linkedin_link: request?.linkedin_link })
    await requestServive.removeRequestByUserId(userId,role)
    return await User.findByIdAndUpdate(userId, { status: 'accepted' })
}

const rejectUser = async (id, role) => {
    const request = await requestServive.getRequestByUserId(id, role);
    if (request?.rc_ice) {
        await FileService.deleteFile("rc_ice", "Members/" + id);
    }
    await requestServive.removeRequestByUserId(id, role)
    return await User.findByIdAndUpdate(id, { status: 'rejected' })
}

async function checkUserVerification(req, res, next) {
    const userId = req.params.userid;

    try {
        const user = await User.findById(userId); 

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.status =='notVerified') {
            return res.status(403).json({ error: 'User is not verified' });
        }

        next();
    } catch (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      const user = await EmailingService.verifyResetToken(token);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;

      return await User.findByIdAndUpdate(user._id, user)
  
    } catch (error) {
        throw new Error(error);
    }
  }

  const updateFullName = async ( userId, fullName , image , language) => {
    const user = await User.findById(userId);
        
    if (!user) {
        throw new Error('User not found');
    }
    if(fullName) {
        user.displayName = fullName;
    }
    if(image) {
        user.image = image;
    } 
    if(language){
        user.language = language;
    }
    await user.save();
    return user;
};
  
module.exports = { getUserByID, deleteUser, approveUserService, rejectUser, getUsers, checkUserVerification, 
    updateUser , resetPassword , getUserByEmail , updateFullName,updateUserLanguageRegionService}
