const EventService =require('../services/EventService');

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

const getEvents=async(req,res)=>{
    try {
        const events = await EventService.getAllEvents(req.query);
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

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getAllEventsByUser,
    addAttendeeToEvent,
    sendTicketToUser,
    supprimerCollection
};