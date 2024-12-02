const User = require('../models/User');
const MemberService = require('../services/MemberService');
const PartnerService = require('../services/PartnerService');
const InvestorService = require('../services/InvestorService');
const requestServive = require('../services/RequestService');
const FileService = require('../services/FileService');
const EmailingService = require('../services/EmailingService');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const bcrypt = require('bcrypt');
const UserLog = require('../models/UserLog');
const salt=10

const getUsers = async (args) => {
    return await User.find().skip(args.start ? args.start : null).limit(args.qt ? args.qt : null).sort({ dateCreated: 'desc' });
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
    await ActivityHistoryService.createActivityHistory(userId, 'profile_update_lang_reg', { targetName : '' , targetDesc: '' });
    return user;
}

const getUserByID = async (id) => {
    try {
        const user = await User.findById(id)
            .populate('subscription') 
            .exec(); 

        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        throw new Error(`Error retrieving user by ID: ${error.message}`);
    }
};
// const getUserByEmail = async (email) => {
//     try {
//         if (!email) {
//             throw new Error("Email is required");
//         }
        
//         let user = await User.findOne({ email: email.toLowerCase() });

//         if (!user) {
//             user = await User.findOne({ email: email });
//         }

//         return user;
        
//     } catch (error) {
//         console.error("Error fetching user by email:", error);
//         throw new Error("Failed to retrieve user.");
//     }
// }

const getUserByEmail = async (email) => {
    try {
        // Vérification de l'entrée
        if (!email || typeof email !== 'string') {
            throw new Error("A valid email is required.");
        }

        const normalizedEmail = email.toLowerCase();

        const user = await User.findOne({ email: normalizedEmail }).lean().maxTimeMS(60000); 

        return user || null;
    } catch (error) {
        console.error("Error fetching user by email:", error);
        throw new Error(error);
    }
};

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

const resetPassword = async (token, newPassword, confirmPassword, language) => {
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

      await EmailingService.markTokenAsUsed(token);

      const result = await User.findByIdAndUpdate(user._id, user)

      await EmailingService.sendResetPasswordConfirmation(user._id, language);
      await ActivityHistoryService.createActivityHistory(user._id, 'password_reset', { targetDesc:'From SignIn' });
     return result;
  
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
    // if(image) {
    //     user.image = image;
    // } 
    if(language){
        user.language = language;
    }
    await user.save();
    return user;
};

const updateUserProfile = async (userId, updatedFields , image) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (image) {
        const imageURL = await FileService.uploadFile(
            image,
            `Users/${userId}/userProfile`,
            image.originalname
        );
        updatedFields.image = imageURL; 
      }
  
        Object.assign(user, updatedFields);

        const updatedUser = await user.save();

        return updatedUser;
    } catch (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }
};

const countUsersByMonth = async () => {
    try {
        const currentYear = new Date().getFullYear();
        const monthlyCounts = [];

        for (let month = 0; month < 12; month++) {
            const endDate = new Date(currentYear, month + 1, 0, 23, 59, 59); 

            const usersCount = await User.countDocuments({
                dateCreated: { $lte: endDate }
            });

            // Add the count for this month to the result array
            monthlyCounts.push({
                month: endDate.toLocaleString('en', { month: 'short' }),
                count: usersCount
            });
        }

        return {
            year: currentYear,
            monthlyCounts
        };
    } catch (error) {
        throw new Error(`Error counting users by month: ${error.message}`);
    }
};

const getDistinctValues = async (field) => {
    try {
      const distinctValues = await User.distinct(field, { isDeleted: false });
      return distinctValues;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des valeurs distinctes: ${error.message}`);
    }
  };
  
module.exports = { getUserByID, deleteUser, approveUserService, rejectUser, getUsers, checkUserVerification, 
    updateUser , resetPassword , getUserByEmail , updateFullName,updateUserLanguageRegionService , 
updateUserProfile , countUsersByMonth , getDistinctValues
}
