const EventService =require('../services/EventService');
const EmailingService = require('../services/EmailingService');

const createEvent=async(req,res)=>{
    try {
        const eventData = req.body;
        const imageData = req.files['image'];
        const headerImage = req.files['headerImage'];
        const organizerLogo = req.files['organizerLogo'];
        const newEvent = await EventService.createEvent(req.userId ,eventData, imageData?.[0], headerImage?.[0] , organizerLogo?.[0]);
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function addPromoCode(req, res) {
  const { eventId } = req.params;
  try {
    const event = await EventService.addPromoCode(eventId, req.body);
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const getEvents=async(req,res)=>{
    try {
        const events = await EventService.getAllEvents(req.query);
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getEventsUpcoming =async(req,res)=>{
  try {
      const events = await EventService.getAllEventsUpcoming(req.query);
      res.status(200).json(events);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

const getEventById=async(req,res)=>{
    try {
        const eventId = req.params.id;
        const event = await EventService.getEventById(eventId);
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getEventByIdWithParticipate=async(req,res)=>{
  try {
      const eventId = req.params.id;
      const event = await EventService.getEventByIdWithParticipate(eventId , req.userId);
      res.status(200).json(event);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

async function getAllEventsByUser(req, res) {
    const { userId } = req.params;
  
    try {
      const events = await EventService.getAllEventsByUser(userId);
      res.status(200).json({ success: true, events });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
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

  const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params; 
        let data =  req?.body 
        const imageData = req.files['image']; 
        const headerImage = req.files['headerImage']; 
        const organizerLogo = req.files['organizerLogo']; 

        const updatedEvent = await EventService.updateEvent(eventId, data, imageData?.[0], headerImage?.[0], organizerLogo?.[0]);
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function addAttendeeToEvent(req, res) {
    const { eventId } = req.params;
    const attendeeData = req.body;
  
    try {
      const updatedEvent = await EventService.addAttendeeToEvent(eventId, attendeeData);
      res.status(200).json({ success: true, event: updatedEvent });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

const deleteEvent =async(req, res) =>{
    try {
        const eventId = req.params.id;
        await EventService.deleteEvent(eventId);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const sendTicketToUser = async (req, res) => {
    try {
      const result = await EmailingService.sendTicketToUser( req.body,req.params.eventId);
      const updatedEvent = await EventService.addAttendeeToEvent(req.params.eventId, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json(error);
    }
  };

async function supprimerCollection(req, res) {
  try {
    await EventService.supprimerCollection(); 
    res.status(200).json({ message: 'La collection a été supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la collection :', error);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la suppression de la collection.' });
  }
}

async function addConnectedAttendee(req, res) {
  try {
    const event = await EventService.addConnectedAttendee(req.params.eventId, req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateConnectedAttendee(req, res) {
  try {
    const event = await EventService.updateConnectedAttendee(req.params.eventId, req.params.attendeeId, req.body);
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function deleteConnectedAttendee(req, res) {
  try {
    const event = await EventService.deleteConnectedAttendee(req.params.eventId, req.params.attendeeId);
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getEventsForUser(req, res) {
  const userId = req.userId; 
  try {
      const events = await EventService.getEventsForUser(userId , req.query);
      res.json(events);
  } catch (error) {
      res.status(500).json({ message: error });
  }
}

// const getDistinctFieldValues = async (req, res) => {
//   try {
//       const field = req.params.field;
//       const distinctValues = await EventService.getDistinctValues(field);
//       res.status(200).json(distinctValues);
//   } catch (error) {
//       res.status(500).json({ error: error.message });
//   }
// };

const getDistinctFieldValues = async (req, res) => {
  try {
    const { field } = req.params; 
    const filter = req.query || {}; 

    if (!field) {
      return res.status(400).json({ message: "Field is required" });
    }

    // Récupère les valeurs distinctes pour le champ donné avec un filtre
    const distinctValues = await EventService.getDistinctValues(field, filter);
    res.status(200).json({ distinctValues });
  } catch (error) {
    console.error("Error fetching distinct values:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Contrôleur pour obtenir les événements passés avec participation de l'utilisateur
const getPastEventsForUserParticipate = async (req, res) => {
  try {
      const userId = req.userId;
      const events = await EventService.getPastEventsWithUserParticipation(userId , req.query);
      res.status(200).json(events);
  } catch (error) {
    console.log(error)
      res.status(500).json({ error: error.message });
  }
};

const getAllUpcomingEventsForUserParticipate = async (req, res) => {
  try {
      const userId = req.userId;
      const events = await EventService.getAllUpcommingEvents(userId , req.query);
      res.status(200).json(events);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

const getUpcomingEventsWithoutSponsorNotSent = async (req, res) => {
  try {
    const args = req.query;
    const result = await EventService.getAllUpcomingEventsWithSponsorsNotSent(req.userId, req.partnerId, args);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDistinctValuesForUser = async (req, res) => {
  try {
      const distinctValues = await EventService.getDistinctValuesByUser(req.params.field, req.userId);
      res.status(200).json(distinctValues);
  } catch (error) {
    console.log(error)
      res.status(500).json({ error: error.message });
  }
};

const getDistinctFieldValuesUpcomingEventNotSent = async (req, res) => {
  const { field } = req.params;

  try {
    const result = await EventService.getDistinctFieldValuesForUpcomingEventsNotSent(req.partnerId, field);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

const createEventWithJson = async (req, res) => {
  try {
    const eventData = req.body;
    const event = await EventService.createEventWithJson(eventData);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    createEvent, getEvents, getEventById, updateEvent, deleteEvent, getAllEventsByUser, addAttendeeToEvent,
    sendTicketToUser, supprimerCollection , addConnectedAttendee , updateConnectedAttendee , deleteConnectedAttendee ,
    addPromoCode , getEventsForUser , getDistinctFieldValues , getPastEventsForUserParticipate , getDistinctValuesForUser , 
    createEventWithJson , getAllUpcomingEventsForUserParticipate , getEventByIdWithParticipate , 
    getUpcomingEventsWithoutSponsorNotSent , getDistinctFieldValuesUpcomingEventNotSent , getEventsUpcoming
};