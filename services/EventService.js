const Event = require('../models/Event');
const User = require('../models/User');
const EmailService = require('./EmailingService');

// Get all events
async function getAllEvents(args) {
    try {
        const events = await Event.find().skip(args.start ? args.start : null).limit(args.qt ? args.qt : null);;
        return events;
    } catch (error) {
        throw error;
    }
}

//Events by userId
async function getAllEventsByUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('user doesn\'t exist!');
      }
      const events = await Event.find({ creator: userId });
      return events;
    } catch (error) {
      throw new Error(`Error fetching events for user ${userId}: ${error.message}`);
    }
  }

  async function addAttendeeToEvent(eventId, attendeeData) {
    try {
      const event = await Event.findById(eventId);
  
      if (!event) {
        throw new Error(`Event with ID ${eventId} not found`);
      }
  
      event.attendees.push(attendeeData);
      await event.save();
  
      return event;
    } catch (error) {
      throw new Error(`Error adding attendee to event: ${error.message}`);
    }
  }

// Create a new event
async function createEvent(eventData) {
    try {
        if (!eventData.title || !eventData.description || !eventData.date || !eventData.startTime || !eventData.endTime) {
            throw new Error("Please provide all the information required to create an event.");
        }
        const newEvent = new Event(eventData);
        const savedEvent = await newEvent.save();
        return savedEvent;
    } catch (error) {
        throw error;
    }
}

// Get event by ID
async function getEventById(eventId) {
    try {
        const event = await Event.findById(eventId);
        return event;
    } catch (error) {
        throw error;
    }
}

// Update event by ID
async function updateEvent(eventId, eventData) {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, { new: true });
        return updatedEvent;
    } catch (error) {
        throw error;
    }
}

// Delete event by ID
async function deleteEvent(eventId) {
    try {
        const deletedEvent = await Event.findByIdAndDelete(eventId);
        return deletedEvent;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getAllEventsByUser,
    addAttendeeToEvent
};