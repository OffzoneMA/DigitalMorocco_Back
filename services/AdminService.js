const Member = require('../models/Member');
const Investor = require('../models/Investor');
const Partner = require('../models/Partner');

const createAdmin = async (u) => {
    const password = u.password;
    const hashedPassword = await bcrypt.hash(password, salt)
    u.password = hashedPassword
    u.roles = "Admin"
    u.approved = "accepted"
    try {
        return await User.create(u)
    }
    catch (err) {
        throw new Error("Email Already in Use")
    }
}





module.exports = { createAdmin }