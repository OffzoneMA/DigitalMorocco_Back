const UserLog = require('../models/UserLog');

const createuserlog = async (userlog) => {
   
        return await UserLog.create(userlog)
}
module.exports={createuserlog}