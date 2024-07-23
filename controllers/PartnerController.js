const PartnerService = require('../services/PartnerService');
const UserLogService = require('../services/UserLogService');


const getpartners = async (req, res) => {
    try {
        const result = await PartnerService.getAllPartners(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getpartnersAll = async (req, res) => {
    try {
        const result = await PartnerService.getAllPartnersAll();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addPartner = async (req, res) => {
    try {
        const result = await PartnerService.CreatePartner(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const createEnterprise = async (req, res) => {
    try {
        let data = isJsonString(req?.body.infos) ? JSON.parse(req?.body.infos) : req?.body.infos
        const result = await PartnerService.createEnterprise(req.partnerId, data, req?.files?.files, req?.files?.logo);
        const partner = await PartnerService.getPartnerById(req.partnerId);
        const log = await UserLogService.createUserLog('Enterprise Edited', partner.owner);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProjects = async (req, res) => {
    try {
        const result = await PartnerService.getProjects()
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" });
    }
}

async function getPartnerById(req, res) {
    try {
      const partner = await PartnerService.getPartnerById(req.params.id);
      if (!partner) {
        return res.status(404).json({ error: 'Partner not found' });
      }
      res.status(200).json(partner);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async function updatePartner(req, res) {
    try {
      const partner = await PartnerService.updatePartner(req.params.id, req.body);
      if (!partner) {
        return res.status(404).json({ error: 'Partner not found' });
      }
      res.status(200).json(partner);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async function deletePartner(req, res) {
    try {
      const partner = await PartnerService.deletePartner(req.params.id);
      if (!partner) {
        return res.status(404).json({ error: 'Partner not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}



module.exports = { addPartner, createEnterprise, getpartners, getProjects , updatePartner , 
    getPartnerById , deletePartner , getpartnersAll
 }