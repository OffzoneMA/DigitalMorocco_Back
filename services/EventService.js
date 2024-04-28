const Event = require('../models/Event');
const User = require('../models/User');
const EmailService = require('./EmailingService');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const uploadService = require('./FileService');


// Get all events
async function getAllEvents(args) {

    try {
      const page = args.page || 1;
      const pageSize = args.pageSize || 10;
      const skip = (page - 1) * pageSize;

      const totalCount = await Event.countDocuments();
      const totalPages = Math.ceil(totalCount / pageSize);

      const events = await Event.find().skip(skip)
        .limit(pageSize);
        return {totalPages,events};
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
      const attendeeId = event.attendees[event.attendees.length - 1]._id;

      const historyData = {
        eventType: 'event_attended',
        eventDetails: 'Attending Event',
        timestamp: new Date(),
        user: attendeeId,
        actionTargetType: 'Event',
        actionTarget: eventId,  
    };

    await ActivityHistoryService.createActivityHistory(historyData);

      await event.save();
  
      return event;
    } catch (error) {
      throw new Error(`Error adding attendee to event: ${error.message}`);
    }
  }

// Create a new event
async function createEvent(userId ,eventData , imageData ,headerImage , organizerLogo) {
    try {
        const newEvent = new Event({creator: userId, ...eventData});

        if (imageData) {
            const logoURL = await uploadService.uploadFile(imageData, 'Events/' + userId + "/images/", imageData.originalname);
            newEvent.image = logoURL;
        }

        if (headerImage) {
          const headerImageURL = await uploadService.uploadFile(headerImage, 'Events/' + userId + "/images/", headerImage.originalname);
          newEvent.headerImage = headerImageURL;
      }

        if (organizerLogo) {
          const organizerLogoURL = await uploadService.uploadFile(organizerLogo, 'Events/' + userId + "/images/organizers", organizerLogo.originalname);
          newEvent.organizerLogo = organizerLogoURL;
      }
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
async function updateEvent(eventId, eventData, imageData, headerImage, organizerLogo) {
  try {
    const event = await Event.findById(eventId);
      if (!event) {
          throw new Error('Event not found');
      }

      event.title = eventData.title || event.title;
      event.description = eventData.description || event.description;
      event.summary = eventData.summary || event.summary;
      event.promoCode = eventData.promoCode || event.promoCode;
      event.startDate = eventData.startDate || event.startDate;
      event.endDate = eventData.endDate || event.endDate;
      event.startTime = eventData.startTime || event.startTime;
      event.endTime = eventData.endTime || event.endTime;
      event.locationType = eventData.locationType || event.locationType;
      event.category = eventData.category || event.category;
      event.industry = eventData.industry || event.industry;
      event.physicalLocation = eventData.physicalLocation || event.physicalLocation;
      event.longitude = eventData.longitude || event.longitude;
      event.latitude = eventData.latitude || event.latitude;
      event.tags = eventData.tags || event.tags;
      event.youtubeVideo = eventData.youtubeVideo || event.youtubeVideo;
      event.zoomLink = eventData.zoomLink || event.zoomLink;
      event.zoomMeetingID = eventData.zoomMeetingID || event.zoomMeetingID;
      event.zoomPasscode = eventData.zoomPasscode || event.zoomPasscode;
      event.price = eventData.price || event.price;
      event.salesEndDate = eventData.salesEndDate || event.salesEndDate;
      event.availableQuantity = eventData.availableQuantity || event.availableQuantity;
      event.organizername = eventData.organizername || event.organizername;
      event.status = eventData.status || event.status;
      event.sponsors = eventData.sponsors || event.sponsors;

      if (imageData) {
          const imageURL = await uploadService.uploadFile(imageData, 'Events/' + eventData.creator + "/images/", imageData.originalname);
          event.image = imageURL;
      }

      if (headerImage) {
          const headerImageURL = await uploadService.uploadFile(headerImage, 'Events/' + eventData.creator + "/images/", headerImage.originalname);
          event.headerImage = headerImageURL;
      }

      if (organizerLogo) {
          const organizerLogoURL = await uploadService.uploadFile(organizerLogo, 'Events/' + eventData.creator + "/images/organizers", organizerLogo.originalname);
          event.Organizeby.organizerLogo = organizerLogoURL;
      }

      const updatedEvent = await event.save();

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