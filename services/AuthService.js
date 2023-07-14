const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const salt = 10


const createUser = async (u) => {
    const password = u.password;
    const hashedPassword = await bcrypt.hash(password, salt)
    u.password = hashedPassword
    return await User.create(u)
}



const SignInUser = async (u) => {
    const user = await User.findOne({ email: u.email });
    if (user) {
        const cmp = await bcrypt.compare(u.password, user.password);
        if (cmp) {
            const accessToken = await generateAccessToken(user)
            return { accessToken: accessToken, user: user }
        } else {
            throw new Error('Wrong password !');
        }
    } else {
        throw new Error("Wrong email .");
    }
}




const generateAccessToken = async (user) => {
    return jwt.sign({ user: { _id: user._id, email: user.email } }, process.env.ACCESS_TOKEN_SECRET)
}


module.exports = { createUser, SignInUser }