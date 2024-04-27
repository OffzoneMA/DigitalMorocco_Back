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
      const milestoneData = req.body;
  
      const updatedProject = await ProjectService.addMilestone(projectId, milestoneData);

      const member = await MemberService.getMemberById(updatedProject.owner);
      const log = await UserLogService.createUserLog('Project Add milestone', member.owner);
  
      res.status(200).json(updatedProject);
    } catch (error) {
      console.error('Error adding milestone to project:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

module.exports = {  getprojects , deleteProject , getProjectById , addMilestone}