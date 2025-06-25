const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const salt = 10
const MemberService = require('../services/MemberService');
const PartnerService = require('../services/PartnerService');
const InvestorService = require('../services/InvestorService');
const ProjectService = require('../services/ProjectService');
const EventService = require('../services/EventService');
const InvestorContactService = require('../services/InvestorContactService');
const SponsorService = require('../services/SponsorService');
const metrics = require('../metrics/prometheus');
const Member = require('../models/Member')

// const signInUser = async (u) => {
//   let user = await User.findOne({ email: u.email.toLowerCase() })
//     .populate('subscription') 
//     .exec();

//   // If no user is found with the lowercased email, search with the original email
//   if (!user) {
//     user = await User.findOne({ email: u.email })
//       .populate('subscription') 
//       .exec();
//   }   
//   if (user &&!user?.password){
//         if(user.googleId)  { throw new Error("This email is registered through Google.");}
//         if (user.linkedinId)  { throw new Error("This email is registered through Linkedin.");}
//         if (user.facebookId)  { throw new Error("This email is registered through Facebook.");}
//         else { throw new Error("This email is registered through another provider."); }
//      }
//     if (user) {

//         if (user.isDeleted) {
//             const deletionDate = new Date(user.deletionDate);
//             const currentDate = new Date();
//             const daysDifference = Math.ceil((currentDate - deletionDate) / (1000 * 60 * 60 * 24));
      
//             if (daysDifference <= 14) {
//               user.isDeleted = false;
//               user.deletionDate = null;
//               await user.save();
//             } else {
//               throw new Error("Account permanently deleted.");
//             }
//           }

//         const cmp = await bcrypt.compare(u.password, user.password);
//         if (cmp) {
//           const result= await generateUserInfos(user)
//             return result
//         } else {
//             throw new Error('Wrong password !');
//         }
//     } else {
//         throw new Error("Wrong email .");
//     }
// }

const signInUser = async (u) => {
  try {
      if (!u.email || !u.password) {
          throw new Error("Email and password are required.");
      }
  
      if (typeof u.email !== 'string' || typeof u.password !== 'string') {
        return res.status(400).json({ message: 'Invalid input format' });
      }

      // Normalisation de l'email
      const normalizedEmail = u.email.trim().toLowerCase();

      // Recherche de l'utilisateur par email
      const user = await User.findOne({ email: normalizedEmail })
          .populate('subscription')
          .exec();

      // Vérification si l'utilisateur existe
      if (!user) {
          throw new Error("Email not found.");
      }

      // Gestion des comptes liés à des fournisseurs externes
      if (!user.password) {
          if (user.googleId) {
              throw new Error("This email is registered through Google.");
          }
          if (user.linkedinId) {
              throw new Error("This email is registered through LinkedIn.");
          }
          if (user.facebookId) {
              throw new Error("This email is registered through Facebook.");
          }
          throw new Error("This email is registered through another provider.");
      }

      // Gestion des comptes supprimés
      if (user.isDeleted) {
          const deletionDate = new Date(user.deletionDate);
          const currentDate = new Date();
          const daysDifference = Math.ceil((currentDate - deletionDate) / (1000 * 60 * 60 * 24));

          if (daysDifference > 14) {
              throw new Error("This account has been permanently deleted.");
          }

          // Réactivation automatique si dans la période de grâce
          user.isDeleted = false;
          user.deletionDate = null;
          await user.save();
      }

      const isPasswordCorrect = await bcrypt.compare(u.password, user.password);
      if (!isPasswordCorrect) {
          throw new Error("Incorrect password.");
      }

      metrics.userSessionsCounter.inc({
        user_type: user.role,
        auth_method: 'password',
        status: 'success'
    });

      user.lastLogin = new Date();
      await user.save();
    
      const result = await generateUserInfos(user);
      return result;

  } catch (error) {
    metrics.userSessionsCounter.inc({
      user_type: 'unknown',
      auth_method: 'password',
      status: 'failed'
    });
      console.error("Error in signInUser:", error.message);
      throw new Error(error.message || "An error occurred during sign-in.");
  }
};

/**
 * Create a new user with validation and security measures
 * @param {Object} userData - User data to create account
 * @returns {Promise<{accessToken: string, user: Object}>}
 */
const createUser = async (userData) => {
  try {
    // Validate required fields
    const { email, password } = userData;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('Invalid input format');
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(normalizedEmail)) {
      throw new Error('Invalid email format');
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new Error('Email already exists!');
    }

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      ...userData,
      email: normalizedEmail,
      password: hashedPassword,
    };

    const createdUser = await User.create(newUser);

    const accessToken = await generateAccessToken(createdUser);

    return {
      accessToken,
      user: createdUser,
    };
  } catch (error) {
    throw new Error('User creation failed. Please try again.');
  }
};


const getAllUsers = async () => {
  try {
    const users = await User.find({ isDeleted: false }).sort({ dateCreated: 'desc' });
    return users;
  } catch (error) {
    throw new Error(`Error getting list of users: ${error.message}`);
  }
}

const getAllUsersPage = async (page = 1, limit = 8, roles = [], statuses = [], dateFilter = null, sortField = 'dateCreated', sortOrder = 'desc') => {
  try {
    const filters = { isDeleted: false };
    
    // Filtrage par rôles
    if (roles.length > 0) {
      filters.role = { $in: roles };
    }
    
    // Filtrage par statuts
    if (statuses.length > 0) {
      filters.status = { $in: statuses };
    }

    // Filtrage par date
    if (dateFilter && dateFilter.date && dateFilter.date !== 'Invalid Date' && dateFilter.date.trim() !== '') {
      const startDate = new Date(dateFilter.date);

      if (!isNaN(startDate.getTime())) {
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);

        const dateField = dateFilter.field === 'lastLogin' ? 'lastLogin' : 'dateCreated';
        
        filters[dateField] = {
          $gte: startDate,
          $lte: endDate
        };
      } else {
        console.log('Date invalide ignorée:', dateFilter.date);
      }
    }

    const totalUsers = await User.countDocuments(filters);
    const totalPages = Math.ceil(totalUsers / limit);
    const currentPage = page > totalPages ? 1 : page;

    // Création de l'objet de tri dynamique
    const sortOptions = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder;
    }

    const users = await User.find(filters)
      .sort(sortOptions)
      .skip((currentPage - 1) * limit)
      .limit(limit);

    return {
      data: users,
      pagination: {
        currentPage,
        totalPages,
        totalItems: totalUsers,
      },
    };
  } catch (error) {
    console.log(error);
    throw new Error(`Error getting list of users: ${error.message}`);
  }
};


 
// const generateUserInfos = async (user) => {
//     const accessToken = await generateAccessToken(user)
//     let data
//     let projectCount = 0;
//     let eventCount = 0;
   
//     if (user?.role?.toLowerCase() == "member"){
//         let member = await MemberService.getMemberByUserId(user._id)
//         projectCount = await ProjectService.countProjectsByMemberId(member?._id);
//         data = {
//             ...member?._doc ? member._doc : member,
//             projectCount
//         };

//     }
//     if (user?.role?.toLowerCase() == "partner") {
//         let partner = await PartnerService.getPartnerByUserId(user._id)
//         data = partner?._doc ? partner?._doc : partner
//     }
//     if (user?.role?.toLowerCase() == "investor") {
//         let investor = await InvestorService.getInvestorByUserId(user._id)
//         data = investor?._doc ? investor?._doc : investor
//     }

//     eventCount = await EventService.countEventsByUserId(user?._id);
//     const result = user?._doc 
//     ? { ...user._doc, [user?.role?.toLowerCase()]: data, eventCount } 
//     : { ...user, [user?.role?.toLowerCase()]: data, eventCount };    
    
//     return { accessToken: accessToken, user: result }
// }

const generateUserInfos = async (user) => {
  console.log('generateUserInfos input user:', user?._id); // Debug log

  const accessToken = await generateAccessToken(user);
  console.log('Generated accessToken:', accessToken); // Debug log

  let data = null;
  let projectCount = 0;
  let eventCount = 0;

  // Vérifier si user et role existent avant de faire le toLowerCase()
  const userRole = user?.role?.toLowerCase();
  console.log('User role:', userRole); // Debug log

  if (userRole) {
      if (userRole === "member") {
          let member = await MemberService.getMemberByUserId(user._id);
          console.log(user)
          console.log('Found member:', member ); // Debug log
          
          if (member?._id) {
              projectCount = await ProjectService.countProjectsByMemberId(member._id);
              data = {
                  ...(member._doc || member),
                  projectCount
              };
          }
      }
      else if (userRole === "partner") {
          let partner = await PartnerService.getPartnerByUserId(user._id);
          console.log('Found partner:', partner); // Debug log
          data = partner?._doc || partner;
      }
      else if (userRole === "investor") {
          let investor = await InvestorService.getInvestorByUserId(user._id);
          console.log('Found investor:', investor); // Debug log
          data = investor?._doc || investor;
      }
  }

  eventCount = await EventService.countEventsByUserId(user?._id);
  console.log('Event count:', eventCount); // Debug log

  // Simplifier la logique de construction du résultat
  const baseUser = user?._doc || user;
  const result = {
      ...baseUser,
      eventCount
  };

  // N'ajouter les données spécifiques au rôle que si elles existent
  if (userRole && data) {
      result[userRole] = data;
  }

  console.log('Final result:', { accessToken, user: "user data" }); // Debug log

  return { 
      accessToken, 
      user: result 
  };
}

const generateUserInfosAll = async (user) => {
  const accessToken = await generateAccessToken(user);
  let roleData = {};
  let projectCount = 0;
  let eventCount = 0;
  let investmentCount = 0;
  let sponsorCount = 0;
  let sponsorRequest = 0;
  let contactCount = 0;

  if (user?.role?.toLowerCase() === "member") {
    const member = await MemberService.getMemberInfoByUserId(user._id);
    projectCount = await ProjectService.countProjectsByMemberId(member?._id);
    investmentCount = await InvestorContactService.countApprovedInvestments('member' ,member?._id);
    roleData = {
      ...member?._doc ? member._doc : member,
      projectCount,
      investmentCount
    };
  } else if (user?.role?.toLowerCase() === "partner") {
    const partner = await PartnerService.getPartnerByUserId(user._id);
    sponsorCount = await SponsorService.countApprovedSponsorsByPartner(partner?._id);
    sponsorRequest = await SponsorService.countRequestsByPartner(partner?._id);
    roleData ={ 
      ...partner?._doc ? partner._doc : partner,
    sponsorCount , 
    sponsorRequest}
  } else if (user?.role?.toLowerCase() === "investor") {
    const investor = await InvestorService.getInvestorByUserId(user._id);
    investmentCount = await InvestorContactService.countApprovedInvestments('investor' ,investor?._id);
    contactCount = await InvestorContactService.countContactRequestsForInvestor(investor?._id);
    roleData = {
      ...investor?._doc ? investor._doc : investor ,
      investmentCount ,
      contactCount
    }
  }

  eventCount = await EventService.countEventsByUserId(user?._id);

  // Combine user info and role-specific data into one object for easy access
  const userInfo = user?._doc ? { ...user._doc } : { ...user };
  const result = {
    ...userInfo,
    ...roleData,
    eventCount,
  };

  return { accessToken, user: result };
};

 const generateAccessToken = async (user) => {
    const payload = user?.role
  ? { user: { _id: user?._id, email: user?.email, role: user?.role } }
  : { user: { _id: user?._id, email: user?.email } };
     return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)
}

module.exports = {signInUser, createUser, generateAccessToken, generateUserInfos , 
  generateUserInfosAll , getAllUsers , getAllUsersPage}
