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
        console.log(projectId, milestoneId)
  
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

module.exports = {  getprojects , deleteProject , getProjectById , addMilestone , removeMilestone ,
  updateProjectStatus
}