const Project = require("../models/Project");

const CreateProject = async (p) => {
    return await Project.create(p);
}

const getProjectByMemberId = async (memberId) => {
    return await Project.findOne({ owner: memberId });
}

const getProjectById = async (id) => {
    return await Project.findById(id);
}

const ProjectByNameExists = async (name) => {
    return await Project.exists({ name: name })
}




module.exports = { CreateProject, getProjectById, ProjectByNameExists, getProjectByMemberId }