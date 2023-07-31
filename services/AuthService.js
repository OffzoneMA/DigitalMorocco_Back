const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const salt = 10





const signInUser = async (u) => {
    const user = await User.findOne({ email: u.email });
    if (user &&!user?.password){
        if(user.googleId)  { throw new Error("This email is registered through Google.");}
        if (user.linkedinId)  { throw new Error("This email is registered through Linkedin.");}
        else { throw new Error("This email is registered through another provider."); }
     }
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

const createUser = async (u) => {
    if (await User.findOne({ email: u.email })) {
        throw new Error('Email already exists!')
    }
    const password = u.password;
    const hashedPassword = await bcrypt.hash(password, salt)
    u.password = hashedPassword
     const user=await User.create(u)
     const accessToken = await generateAccessToken(user)
     return { accessToken: accessToken, user: user }
}


 const generateAccessToken = async (user) => {
    const payload = user.role
  ? { user: { _id: user._id, email: user.email, role: user.role } }
  : { user: { _id: user._id, email: user.email } };
     return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)
}


module.exports = { signInUser, createUser, generateAccessToken }