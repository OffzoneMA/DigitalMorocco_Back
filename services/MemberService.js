const Member = require("../models/Member");

const CreateMember = async (member) => {
    return await Member.create(member);
}

const getMemberById = async (id) => {
    return await Member.findById(id);
}

const memberByNameExists = async (name) => {
    return await Member.exists({ name: name })

}


module.exports = { CreateMember, getMemberById, memberByNameExists }