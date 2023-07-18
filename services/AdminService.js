const User = require('../models/User');
const bcrypt = require('bcrypt');
const salt = 10


const createAdmin = async (u) => {
    const password = u.password;
    const hashedPassword = await bcrypt.hash(password, salt)
    u.password = hashedPassword
    u.role = "Admin"
    u.approved = "accepted"
    try {
        return await User.create(u)
    }
    catch (err) {
        throw new Error("Email Already in Use")
    }
}





module.exports = { createAdmin }