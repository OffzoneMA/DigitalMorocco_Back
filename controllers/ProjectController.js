const ProjectService = require('../services/ProjectService');
const MemberService = require('../services/MemberService');
const UserLogService = require('../services/UserLogService');

const getprojects = async (req, res) => {
    try {
        const result = await ProjectService.getProjects(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        const result = await ProjectService.deleteProject(req.params.projectId);
        res.status(200).json({ message: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProjectCompletly = async (req, res) => {
    try {
        const result = await ProjectService.deleteProjectCompletly(req.params.projectId);
        res.status(200).json({ message: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProjectById = async (req, res) => {
    try {
        const project = await ProjectService.getProjectById(req.params.projectId);
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
        } else {
            res.status(200).json(project);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

async function addMilestone(req, res) {
    try {
      const { projectId } = req.params;
  
      const updatedProject = await ProjectService.addMilestone(projectId, req.body);

      const member = await MemberService.getMemberById(updatedProject.owner);
      const log = await UserLogService.createUserLog('Project Add milestone', member.owner);
  
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async function removeMilestone(req, res) {
    try {
        const { projectId, milestoneId } = req.params;
  
      const updatedProject = await ProjectService.removeMilestone(projectId, milestoneId);
  
      res.status(200).json(updatedProject);
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: error.message });
    }
  }

  async function updateProjectStatus(req, res) {
    try {
      const { projectId } = req.params;
      const { status } = req.body;
  
      const updatedProject = await ProjectService.updateProjectStatus(projectId, status);
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  const getTopSectors = async (req, res) => {
    try {
      const sectors = await ProjectService.getTopSectors();
      res.status(200).json({ sectors });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve top sectors", error: error.message });
    }
  };  


 const getAllProjects = async (req, res) => {
    try {
        const args = req.query; 
        const result = await ProjectService.getAllProjects(args);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDistinctValuesForField = async (req, res) => {
  const { field } = req.params; 
  const { visibility } = req.query;
  try {
      const values = await ProjectService.getDistinctValues(field , visibility);
      res.status(200).json({ field, values });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const updateData = req.body;

  try {
      const updatedProject = await ProjectService.updateProject(projectId, updateData);
      res.status(200).json({ success: true, data: updatedProject });
  } catch (error) {
      res.status(400).json({ success: false, message: error.message });
  }
};

async function deleteProjectDocument(req, res) {
  try {
      const { projectId, documentId } = req.params;
      const result = await ProjectService.deleteProjectDocument(projectId, documentId);
      res.status(200).json(result);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
}

async function deleteProjectLogo (req, res) {
  try {
      const { projectId } = req.params;
      const result = await ProjectService.deleteProjectLogo(projectId);
      res.status(200).json(result);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
}

const getTheDraftProjects = async (req, res) => {
  try {
    console.log("Fetching draft projects for memberId:", req.memberId);
      const memberId = req.memberId;
      const projects = await ProjectService.getTheDraftProjects(memberId);
      res.status(200).json(projects);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

  const maskProjectByIdsAndUnMaskOthers = async (req, res) => {
  try {
    const { projectsIds } = req.body;
    const memberId = req.memberId;

    const result = await ProjectService.maskProjectByIdsAndUnMaskOthers(projectsIds, memberId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error occurred while masking projects:", error);
  }
};


const unmaskProjectByIds = async (req, res) => {
  try {
    const { projectIds } = req.body;

    const result = await ProjectService.unmaskProjectsByIds(projectIds);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const maskProjectByIds = async (req, res) => {
  try {
    const { projectIds } = req.body;

    const result = await ProjectService.maskProjectsByIds(projectIds);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {  getprojects , deleteProject , getProjectById , addMilestone , 
  removeMilestone , updateProjectStatus , getTopSectors , getAllProjects , 
  getDistinctValuesForField , updateProject , deleteProjectDocument , 
  deleteProjectLogo , getTheDraftProjects , deleteProjectCompletly , 
  maskProjectByIds , unmaskProjectByIds , maskProjectByIdsAndUnMaskOthers
};