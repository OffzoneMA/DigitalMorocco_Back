const EventService =require('../services/EventService');

const createEvent=async(req,res)=>{
    try {
        const eventData = req.body;
        const newEvent = await EventService.createEvent(eventData);
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
  

const updateEvent=async(req,res)=>{
    try {
        const eventId = req.params.id;
        const eventData = req.body;
        const updatedEvent = await EventService.updateEvent(eventId, eventData);
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

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

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getAllEventsByUser,
    addAttendeeToEvent,
    sendTicketToUser
};