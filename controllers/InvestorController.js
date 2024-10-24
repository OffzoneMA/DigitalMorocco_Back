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
        const result = await InvestorService.updateContactStatus(req.investorId,req.params.requestId , req.body.response);
        res.status(200).json(req.body.response);
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
};

module.exports = { getInvestorRequests,updateContactStatus, addInvestor, getInvestors, getContactRequests, getContacts, getProjects}