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

async function addMilestone(projectId, milestoneData) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error("Project not found");
      }
  
      project.milestones.push(milestoneData);
      const updatedProject = await project.save();
      return updatedProject;
    } catch (error) {
      throw new Error('Error adding milestone to project', error);
    }
  }

  async function removeMilestone(projectId, milestoneId) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error("Project not found");
      }
        project.milestones = project.milestones.filter(
        (milestone) => milestone._id != milestoneId
      );
  
      const updatedProject = await project.save();
      return updatedProject;
    } catch (error) {
      throw new Error('Error removing milestone from project', error);
    }
  }
  
async function deleteProject(projectId) {
    try {
        await Project.findByIdAndDelete(projectId);
        return 'Project deleted successfully';
    } catch (error) {
        throw new Error('Error deleting project' , error);
    }
}



module.exports = { getProjects , CreateProject, getProjectById, ProjectByNameExists, 
    getProjectByMemberId , deleteProject, addMilestone , removeMilestone}