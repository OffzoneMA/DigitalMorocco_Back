const InvestorService = require('../services/InvestorService');
const MemberService = require('../services/MemberService');
const UserLogService = require('../services/UserLogService');
const investorRequest = require('../models/Requests/Investor');
const User = require('../models/User');

const InvestorContactService = require('../services/InvestorContactService');

const getInvestors = async (req, res) => {
    try {
       
        const result = await InvestorService.getAllInvestors(req.query);
        
        res.status(200).json(result);
        return;
    } catch (error) {
        
        res.status(500).json( error );
    }
};

const getAllInvestorsWithoutPagination = async (req, res) => {
    try {
       
        const result = await InvestorService.getAllInvestorsWithoutPagination(req.query);
        
        res.status(200).json(result);
        return;
    } catch (error) {
        
        res.status(500).json( error );
    }
};

const getAllInvestors = async (req, res) => {
    try {
       
        const result = await InvestorService.getInvestors();
        
        res.status(200).json(result);
        return;
    } catch (error) {
        
        res.status(500).json( error );
    }
};

const getInvestorRequests = async (req, res) => {
    try {
      // Récupérer la liste des demandes d'investisseurs avec les informations des utilisateurs associés
      const investorRequests = await investorRequest.find({}, 'user linkedin_link dateCreated status communicationStatus attachment note')
        .populate({
          path: 'user',
          model: 'User',
          select: 'displayName -_id' // Sélectionner uniquement le champ displayName et exclure le champ _id
        })
        .lean(); // Convertir les résultats en objets JavaScript pour permettre les modifications
  
      // Modifier la demande d'investisseur pour afficher le nom de l'utilisateur
      investorRequests.forEach(request => {
        request.user = request.user ? request.user.displayName : 'Unknown';
      });
  
      // Retourner la liste des demandes d'investisseurs avec les noms d'utilisateur ajoutés
      res.status(200).json(investorRequests);
    } catch (error) {
      // En cas d'erreur, retourner une réponse d'erreur
      res.status(500).json({ error: error.message });
    }
  };
  
const addInvestor = async (req, res) => {
    try {
        const result = await InvestorService.CreateInvestor(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const getContactRequests = async (req, res) => {
    try {
        const result = await InvestorContactService.getAllContactRequest(req.query, "investor", req.investorId)
        res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong!" });
    }
}

const getContactRequestsByInvestor = async (req, res) => {
    try {
        const result = await InvestorContactService.getAllContactRequest(req.query, "investor", req.params.investorId)
        res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong!" });
    }
}

const getContacts = async (req, res) => {
    try {
        const result = await InvestorService.getContacts( req.investorId)
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" });
    }
}

const getProjects = async (req, res) => {
    try {
        const result = await InvestorService.getProjects( req.investorId)
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" });
    }
}

const updateContactStatus = async (req, res) => {
    try {
        const result = await InvestorService.updateContactStatus(req.params.requestId , req.params.status);
        res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
};

async function getContactRequestsForInvestor(req, res) {
    const investorId = req.params.investorId;
    try {
        const contactRequests = await InvestorContactService.getContactRequestsForInvestor(investorId);
        res.json({ success: true, contactRequests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const updateInvestor = async (req, res) => {
    try {
        const investor = await InvestorService.updateInvestor(req.params.id, req.body);
        if (!investor) {
            return res.status(404).json({ message: "Investor not found" });
        }
        res.status(200).json(investor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getDistinctInvestorData = async (req, res) => {
    const { field } = req.params;
    
    if (!field) {
        return res.status(400).json({ error: 'Field parameter is required' });
    }

    try {
        const distinctValues = await InvestorService.getDistinctValues(field);
        res.json(distinctValues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getInvestorById = async (req, res) => {
    try {
        const investor = await InvestorService.getInvestorById(req.params.id);
        if (!investor) {
            return res.status(404).json({ message: 'Investor not found' });
        }
        res.status(200).json(investor);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

async function getInvestorDetails(req, res) {
    const investorId = req.params.investorId;
    const memberId = req.memberId;
    try {
        const investorDetails = await InvestorService.getInvestorDetailsRequest(memberId, investorId);
        res.status(200).json(investorDetails);
    } catch (error) {
        res.status(500).json({ message: "Error fetching investor details", error: error.message });
    }
}

const getDistinctRequestProjectFields = async (req, res) => {
    try {
        const { field, status } = req.query;
        const id = req.investorId;

        const distinctValues = await InvestorContactService.getDistinctProjectFieldValues("investor", id, field, status);

        // Envoyer la réponse avec les valeurs distinctes
        res.status(200).json({ distinctValues });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDistinctRequestValues = async (req, res) => {
    const {field } = req.params;
    const investorId = req.investorId ;
    try {
        const distinctValues = await InvestorContactService.getDistinctFieldValues("investor", investorId, field);
        res.status(200).json({ distinctValues });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getInvestorRequests,updateContactStatus, addInvestor, getInvestors, 
    getContactRequests, getContacts, getProjects , getContactRequestsForInvestor , updateInvestor , 
    getAllInvestors , getDistinctInvestorData , getInvestorById , getInvestorDetails , 
getAllInvestorsWithoutPagination , getDistinctRequestProjectFields , getDistinctRequestValues , 
getContactRequestsByInvestor}