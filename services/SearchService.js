const User = require('../models/User');
const MemberService = require('../services/MemberService');
const EventService = require('../services/EventService');
const InvestorContactService = require('../services/InvestorContactService');
const InvestorService = require('../services/InvestorService');
const DocumentService = require('../services/DocumentService');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const EmployeeService = require('../services/EmployeeService');
const LegalDocumentService = require('../services/LegalDocumentService');
const PartnerService = require('../services/PartnerService');
const ProjectService = require('../services/ProjectService');
const SubscriptionPlanService = require('../services/SubscriptionPlanService');
const SubscriptionService = require('../services/SubscriptionService');

const searchAccrossModels = async (searchQuery, userId) => {
    try {
      const user = await User.findById(userId);
      const userRole = user?.role?.toLowerCase();
      const userSubs = await SubscriptionService.checkUserSubscription(userId);
      
      let searchResults = [];
  
      const addResults = (label, data) => {
        if (data && data.length > 0) {
          searchResults.push({ label, results: data });
        }
      };
  
      // Événements auxquels l'utilisateur participe
      const participateEvents = await EventService.searchParticipateEvents(user, searchQuery);
      addResults('Participate', participateEvents);
  
      // Événements à venir
      const upcommingEvents = await EventService.searchUpcomingEvents(searchQuery);
      addResults('UpcomingEvents', upcommingEvents);
  
      // Événements passés
      const pastEvents = await EventService.searchPastEvents(searchQuery);
      addResults('PastEvents', pastEvents);
  
      // Contacts des investisseurs
      const investorContacts = await InvestorContactService.searchContactRequests(user, searchQuery);
      addResults('InvestorRequestHistory', investorContacts);
  
      // Documents
      const documents = await DocumentService.searchDocuments(user, searchQuery);
      addResults('Documents', documents);
  
      // Historique d'activité
      const activityHistories = await ActivityHistoryService.searchActivityHistoriesByUser(user, searchQuery);
      addResults('History', activityHistories);
  
      // Employés
      const employees = await EmployeeService.searchEmployees(user, searchQuery);
      addResults('Employees', employees);
  
      // Documents légaux
      const legalDocuments = await LegalDocumentService.searchLegalDocuments(user, searchQuery);
      addResults('LegalDocuments', legalDocuments);
  
      // Projets
      const projects = await MemberService.searchProjects(user, searchQuery);
      addResults('Projects', projects);
  
      // Plans d'abonnement
      const subscriptionsPlan = await SubscriptionPlanService.searchSubscriptionPlans(searchQuery);
      addResults('SubscriptionPlan', subscriptionsPlan);

      const subscriptions = await SubscriptionService.searchSubscriptionsByUser(user , searchQuery);
      addResults('Subscription', subscriptions);
  
      // Résultats spécifiques pour les rôles d'administrateur
      if (userRole === 'admin') {
        const partners = await PartnerService.searchPartners(searchQuery);
        addResults('Partners', partners);
  
        const members = await MemberService.searchMembers(searchQuery);
        addResults('Members', members);
  
        const investors = await InvestorService.searchInvestors(searchQuery);
        addResults('Investors', investors);
      }
  
      // Résultats spécifiques pour les membres
      if (userRole === 'member') {
        const myInvestors = await MemberService.searchInvestorsForMember(user, searchQuery);
        addResults('MyInvestors', myInvestors);
        if(userSubs) {
          const investors = await InvestorService.searchInvestors(searchQuery);
          addResults('Investors', investors);
        }
      }
  
      return searchResults;
  
    } catch (error) {
      throw new Error('Error searching across models: ' + error.message);
    }
};
  

module.exports = {
    searchAccrossModels 
};