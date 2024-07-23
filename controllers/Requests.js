const RequestService = require("../services/RequestService");



const getRequests = async (req, res) => {
    try {
        const result = await RequestService.getRequests(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}

const rejectRequest = async (req, res) => {
    try {
        const result = await RequestService.removeRequest(req.params.id, req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}

async function createRequest(req, res) {
    try {
      const request = await RequestService.createRequestTest(req.body, req.params.id, req.params.role);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async function getRequestByUserId(req, res) {
    try {
      const request = await RequestService.getRequestByUserId(req.params.userId, req.params.role);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      res.status(200).json(request);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async function removeRequest(req, res) {
    try {
      await RequestService.removeRequest(req.params.id, req.params.type);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async function removeRequestByUserId(req, res) {
    try {
      await RequestService.removeRequestByUserId(req.params.userId, req.params.type);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }




module.exports = { getRequests, rejectRequest  , removeRequest , removeRequestByUserId , 
    createRequest , getRequestByUserId
}