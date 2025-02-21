const Project = require("../models/Project");
const ActivityHistoryService = require('../services/ActivityHistoryService');
const MemberService = require('../services/MemberService');
const uploadService = require('./FileService')
const Member = require('../models/Member');

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
        const projects = await Project.find({isDeleted: false }).skip(args.start ? args.start : null).limit(args.qt ? args.qt : null);;
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

        await Project.findByIdAndUpdate(projectId, { isDeleted: true });

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

// const countProjectsByMember = async () => {
//   try {
//       const results = await Project.aggregate([
//           {
//               $group: {
//                   _id: "$owner",
//                   projectCount: { $sum: 1 }
//               }
//           }
//       ]);

//       const formattedResults = results.map(result => ({
//           memberId: result._id,
//           projectCount: result.projectCount
//       }));

//       return formattedResults;
//   } catch (error) {
//       console.error("Error counting projects by member:", error);
//       throw error;
//   }
// };

const countProjectsByMember = async () => {
  try {
    const results = await Project.aggregate([
      {
        $match: { isDeleted: false } // Exclure les projets supprimés
      },
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
    const projectCount = await Project.countDocuments({
      owner: memberId,
      isDeleted: false // Exclure les projets supprimés
    });
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

// const getTopSectors = async () => {
//   // Get total number of projects
//   const totalProjects = await Project.countDocuments();

//   const sectors = await Project.aggregate([
//     {
//       $group: {
//         _id: "$sector",
//         count: { $sum: 1 }
//       }
//     },
//     {
//       $sort: { count: -1 }
//     },
//     {
//       $limit: 5
//     },
//     {
//       $project: {
//         sector: "$_id",
//         _id: 0,
//         count: 1,
//         percentage: { $multiply: [{ $divide: ["$count", totalProjects] }, 100] }
//       }
//     }
//   ]);

//   return sectors;
// };


const getTopSectors = async () => {
  try {
    const sectors = await Project.aggregate([
      {
        $match: { 
          $or: [
            { isDeleted: false }, // Projets explicitement non supprimés
            { isDeleted: { $exists: false } } // Projets sans champ `isDeleted`
          ]
        }
      },
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
        // Étape pour ajouter le total global des projets
        $group: {
          _id: null, // Pas de regroupement ici
          total: { $sum: "$count" },
          sectors: { $push: { sector: "$_id", count: "$count" } }
        }
      },
      {
        // Étape pour calculer les pourcentages
        $unwind: "$sectors"
      },
      {
        $project: {
          sector: "$sectors.sector",
          count: "$sectors.count",
          percentage: {
            $multiply: [
              { $divide: ["$sectors.count", "$total"] },
              100
            ]
          }
        }
      },
      {
        $sort: { count: -1 } // Réapplique le tri après le calcul des pourcentages
      }
    ]);

    return sectors;
  } catch (error) {
    console.error("Error fetching top sectors:", error);
    throw error;
  }
};


const getAllProjects = async (args) => {
  try {
      const page = args.page || 1;
      const pageSize = args.pageSize || 15;
      const skip = (page - 1) * pageSize;

      // Base filter to find projects owned by the member
      const filter = {isDeleted: false};
      // const filter = { isDeleted: { $ne: true } };

      // Filter by visibility if provided
      if (args.visibility) {
          filter.visbility = args.visibility;
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

const updateProject = async (projectId, updateData) => {
  try {
      const updatedProject = await Project.findByIdAndUpdate(projectId, updateData, { new: true });
      return updatedProject;
  } catch (error) {
      throw new Error('Error updating project: ' + error.message);
  }
};

async function deleteProjectDocument(projectId, documentId) {
  try {
    // Vérification que projectId et documentId sont valides
    if (!projectId || !documentId) {
      throw new Error("Project ID and Document ID are required.");
    }

    // Trouver le projet
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Trouver le document à supprimer
    const documentIndex = project?.documents.findIndex(doc => doc._id.toString() === documentId);
    if (documentIndex === -1) {
      throw new Error("Document not found");
    }

    // Récupérer le document pour la suppression du fichier
    const document = project.documents[documentIndex];

    // Supprimer le document du tableau
    project.documents.splice(documentIndex, 1);

    // Vérification de l'existence du fichier avant la suppression
    if (document && document.name) {
      try {
        // Suppression du fichier via le service
        const filePath = `Members/${project.owner}/Project_documents/${document.name}`;
        await uploadService.deleteFile(filePath);
        console.log(`File ${document.name} deleted successfully from storage.`);
      } catch (fileError) {
        console.error("Error deleting file:", fileError);
        // Vous pouvez lancer une nouvelle erreur si la suppression du fichier échoue
        throw new Error("Failed to delete the document file from storage.");
      }
    }

    // Sauvegarder le projet après suppression
    await project.save();
    console.log("Project updated successfully after document deletion.");

    return { message: "Document deleted successfully" };
  } catch (error) {
    console.error("Error deleting project document:", error.message);
    throw new Error(error.message);  // Re-throw the error to be handled by the caller
  }
}

const getFileNameFromURL = (url) => {
  try {
      const decodedUrl = decodeURIComponent(url);
      const matches = decodedUrl.match(/([^\/]+)(?=\?|$)/);
      return matches ? matches[0] : null;
  } catch (error) {
      console.error('Error extracting filename from URL:', error);
      return null;
  }
};

async function deleteProjectLogo(projectId) {
  // Vérification que projectId est valide
  if (!projectId) {
    throw new Error("Project ID is required.");
  }
  // Trouver le projet
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  // Trouver le propriétaire du projet
  const member = await MemberService.getMemberById(project?.owner);
  if (!member) {
    throw new Error("Member not found");
  }
  // Supprimer le logo du projet
  if (project?.logo) {
    try {
      // Suppression du fichier via le service
      const oldLogoName = getFileNameFromURL(project.logo);
      if (oldLogoName) {
          await uploadService.deleteFile(oldLogoName, `Members/${member.owner}/Project_logos`);
          console.log('file deleted')
      }

      const updatedProject = await Project.findByIdAndUpdate(projectId, { logo: null }, { new: true });
      await ActivityHistoryService.createActivityHistory(member.owner, 'project_logo_deleted', { targetName: project?.name, targetDesc: `Logo deleted from project ${project._id}` , for: updatedProject?.name });
      return updatedProject;
    } catch (fileError) {
      // Vous pouvez lancer une nouvelle erreur si la suppression du fichier échoue
      throw new Error("Failed to delete the logo file from storage.");
    }
  }
}


module.exports = { getProjects , CreateProject, getProjectById, ProjectByNameExists, 
    getProjectByMemberId , deleteProject, addMilestone , removeMilestone , 
    countProjectsByMember , countProjectsByMemberId , updateProjectStatus , 
  getTopSectors  , getAllProjects , getDistinctValues , updateProject , deleteProjectDocument ,
  deleteProjectLogo
}; 