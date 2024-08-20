const Project = require("../models/Project");
const ActivityHistoryService = require('../services/ActivityHistoryService');
const MemberService = require('../services/MemberService');

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

      const member = await MemberService.getMemberById(project?.owner)
  
      project.milestones.push(milestoneData);
      const updatedProject = await project.save();
      await ActivityHistoryService.createActivityHistory(
        member?.owner,
        'milestone_add_to_project',
        { targetName: milestoneData.name, targetDesc: `Milestone added to project ${project._id}` , to: updatedProject?.name }
    );
      return updatedProject;
    } catch (error) {
      throw new Error('Error adding milestone to project', error);
    }
  }

  async function removeMilestone(projectId, milestoneId) {
    try {
      const project = await Project.findByIdAndUpdate(
        projectId,
        { $pull: { milestones: { _id: milestoneId } } },
        { new: true }
      );

      if (!project) {
          return res.status(404).json({ message: "Project not found." });
      }
      const member = await MemberService.getMemberById(project?.owner)

      await ActivityHistoryService.createActivityHistory(
        member.owner,
        'milestone_removed',
        { targetName: milestoneId, targetDesc: `Milestone removed from project ${project._id}` }
    );
      return project;
    } catch (error) {
      throw new Error('Error removing milestone from project', error);
    }
  }
  
  async function deleteProject(projectId) {
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        const member = await MemberService.getMemberById(project?.owner)

        await Project.findByIdAndDelete(projectId);

        await ActivityHistoryService.createActivityHistory(
          member?.owner,
            'project_deleted',
            { targetName: project.name, targetDesc: `Project deleted with ID ${projectId}` }
        );

        return 'Project deleted successfully';
    } catch (error) {
        throw new Error('Error deleting project', error);
    }
}

const countProjectsByMember = async () => {
  try {
      const results = await Project.aggregate([
          {
              $group: {
                  _id: "$owner",
                  projectCount: { $sum: 1 }
              }
          }
      ]);

      const formattedResults = results.map(result => ({
          memberId: result._id,
          projectCount: result.projectCount
      }));

      return formattedResults;
  } catch (error) {
      console.error("Error counting projects by member:", error);
      throw error;
  }
};

/**
 * Compte le nombre de projets pour un membre donné.
 * 
 * @param {string} memberId - L'ID du membre
 * @returns {Promise<number>} - Le nombre de projets pour ce membre
 */
const countProjectsByMemberId = async (memberId) => {
  try {
      const projectCount = await Project.countDocuments({ owner: memberId });
      return projectCount;
  } catch (error) {
      console.error(`Error counting projects for member ${memberId}:`, error);
      throw error;
  }
};

async function updateProjectStatus(projectId, newStatus) {
  const validStatuses = ["In Progress", "Active", "Stand by"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid status');
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    { status: newStatus },
    { new: true } // Pour retourner le document mis à jour
  );

  if (!project) {
    throw new Error('Project not found');
  }

  const member = await MemberService.getMemberById(project?.owner)

  await ActivityHistoryService.createActivityHistory(
    member?.owner,
      'project_status_updated',
      { targetName: project.name, targetDesc: `Project status updated to ${newStatus} for project ${projectId}` , to: newStatus }
  );

  return project;
}

module.exports = { getProjects , CreateProject, getProjectById, ProjectByNameExists, 
    getProjectByMemberId , deleteProject, addMilestone , removeMilestone , 
    countProjectsByMember , countProjectsByMemberId , updateProjectStatus} 