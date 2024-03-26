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

const getProjects = async(args)=> {
    try {
        const projects = await Project.find().skip(args.start ? args.start : null).limit(args.qt ? args.qt : null);;
        return projects;
    } catch (error) {
        throw error;
    }
}



module.exports = { getProjects , CreateProject, getProjectById, ProjectByNameExists, getProjectByMemberId }