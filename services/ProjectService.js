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
      throw new Error(error?.message);
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
        throw new Error("Project not found");
      }
  
      const member = await MemberService.getMemberById(project?.owner);
  
      await ActivityHistoryService.createActivityHistory(
        member.owner,
        'milestone_removed',
        { targetName: milestoneId, targetDesc: `Milestone removed from project ${project._id}`, to: project?.name }
      );
      return project;
    } catch (error) {
      console.log(error);
      throw error;
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

const getTopSectors = async () => {
  // Get total number of projects
  const totalProjects = await Project.countDocuments();

  const sectors = await Project.aggregate([
    {
      $group: {
        _id: "$sector",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    },
    {
      $project: {
        sector: "$_id",
        _id: 0,
        count: 1,
        percentage: { $multiply: [{ $divide: ["$count", totalProjects] }, 100] }
      }
    }
  ]);

  return sectors;
};


// services/projectService.js

const getAllProjects = async (args) => {
  try {
      const page = args.page || 1;
      const pageSize = args.pageSize || 15;
      const skip = (page - 1) * pageSize;

      // Base filter to find projects owned by the member
      const filter = { };

      // Filter by visibility if provided
      if (args.visibility) {
          filter.visibility = args.visibility;
      }

      // Filter by status if provided
      if (args.status) {
          filter.status = args.status;
      }

      // Filter by date if provided and valid
      if (args.date && args?.date !== 'Invalid Date') {
          const date = new Date(args.date);
          filter.dateCreated = { $gte: date };
      }

      // Filter by sectors if provided (multiselect)
      if (args.sectors && args.sectors.length > 0) {
          filter.sector = { $in: args.sectors.split(',') };
      }

      // Filter by stages if provided (multiselect)
      if (args.stages && args.stages.length > 0) {
          filter.stage = { $in: args.stages.split(',') };
      }

      // Filter by countries if provided (multiselect)
      if (args.countries && args.countries.length > 0) {
          filter.country = { $in: args.countries.split(',') };
      }

      // Count total documents matching the filter
      const totalCount = await Project.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / pageSize);

      // Retrieve projects matching the filter with pagination
      const projects = await Project.find(filter)
          .skip(skip)
          .sort({ dateCreated: 'desc' })
          .limit(pageSize);

      return { projects, totalPages };
  } catch (error) {
      throw new Error('Error fetching projects for member: ' + error.message);
  }
};

const getDistinctValues = async (fieldName) => {
  try {
      const distinctValues = await Project.distinct(fieldName);
      return distinctValues;
  } catch (error) {
      throw new Error(`Error retrieving distinct values for ${fieldName}: ${error.message}`);
  }
};

module.exports = { getProjects , CreateProject, getProjectById, ProjectByNameExists, 
    getProjectByMemberId , deleteProject, addMilestone , removeMilestone , 
    countProjectsByMember , countProjectsByMemberId , updateProjectStatus , 
  getTopSectors  , getAllProjects , getDistinctValues
}; 