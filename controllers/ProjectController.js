const ProjectService = require('../services/ProjectService');

const getprojects = async (req, res) => {
    try {
        const result = await ProjectService.getProjects(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {  getprojects }