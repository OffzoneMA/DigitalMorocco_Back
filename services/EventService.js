const Event = require('../models/Event');
const User = require('../models/User');
const EmailService = require('./EmailingService');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const uploadService = require('./FileService');
const cron = require('node-cron');


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

async function addConnectedAttendee(eventId, attendee) {
  const user = await User.findById(attendee.userId);
  if (!user) {
    throw new Error('User not found');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  event.attendeesUsers.push(attendee);
  await event.save();
  return event;
}

async function updateConnectedAttendee(eventId, attendeeId, updatedAttendee) {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  const attendee = event.attendeesUsers.id(attendeeId);
  if (!attendee) {
    throw new Error('Attendee not found');
  }

  Object.assign(attendee, updatedAttendee);
  await event.save();
  return event;
}

async function deleteConnectedAttendee(eventId, attendeeId) {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  const attendee = event.attendeesUsers.id(attendeeId);
  if (!attendee) {
    throw new Error('Attendee not found');
  }

  attendee.remove();
  await event.save();
  return event;
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

const createEventWithJson = async (eventData) => {
  try {
    const event = new Event(eventData);
    return await event.save();
  } catch (error) {
    throw new Error(`Error creating event: ${error.message}`);
  }
};

async function addPromoCode(eventId, promoCodeData) {
  const event = await Event.findById(eventId);
  event.promoCodes.push(promoCodeData);
  return await event.save();
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
          event.organizerLogo = organizerLogoURL;
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
async function supprimerCollection() {
  try {
    await Event.deleteMany(); 
    console.log('La collection a été supprimée avec succès.');
  } catch (error) {
    console.error('Erreur lors de la suppression de la collection :', error);
  }
}

/**
 * Compter le nombre d'événements auxquels un utilisateur est inscrit.
 * @param {mongoose.Schema.Types.ObjectId} userId - L'ID de l'utilisateur.
 * @returns {Promise<number>} Le nombre d'événements auxquels l'utilisateur est inscrit.
 */
const countEventsByUserId = async (userId) => {
  try {
      // Compter le nombre d'événements où l'utilisateur est dans le tableau 'attendeesUsers'
      const count = await Event.countDocuments({ 'attendeesUsers.userId': userId });
      return count;
  } catch (error) {
      console.error('Erreur lors du comptage des événements:', error);
      throw error;
  }
};


async function getEventsForUser(userId) {
  try {
      const events = await Event.find({ 'attendeesUsers.userId': userId });
      return events;
  } catch (error) {
      throw new Error('Failed to fetch events for user' , error);
  }
}

async function searchParticipateEvents(user, searchTerm) {
  try {
      const regex = new RegExp(searchTerm, 'i'); 

      const events = await Event.find({
          'attendeesUsers.userId': user?._id,
          $or: [
              { title: regex },       
              { description: regex }, 
              { physicalLocation: regex }   ,
              {category: regex}  
          ]
      });

      return events;
  } catch (error) {
      throw new Error('Error searching events for user: ' + error.message);
  }
}

async function searchUpcomingEvents(searchTerm) {
  try {
      const regex = new RegExp(searchTerm, 'i'); 

      const upcomingEvents = await Event.find({
          status: 'upcoming', 
          $or: [
              { title: regex },
              { description: regex },
              { summary: regex },
              { category: regex },
              { industry: regex }
          ]
      }).populate('attendeesUsers.userId');

      return upcomingEvents;
  } catch (error) {
      throw new Error('Error searching upcoming events: ' + error.message);
  }
}

async function searchPastEvents(searchTerm) {
  try {
      const regex = new RegExp(searchTerm, 'i'); 

      const pastEvents = await Event.find({
          status: 'past', 
          $or: [
              { title: regex },
              { description: regex },
              { summary: regex },
              { category: regex },
              { industry: regex }
          ]
      }).populate('attendeesUsers.userId');

      return pastEvents;
  } catch (error) {
      throw new Error('Error searching past events: ' + error.message);
  }
}



cron.schedule('0 0 * * *', async () => {
  try {
      const events = await Event.find();

      events.forEach(async (event) => {
          const currentDate = new Date();
          const startDate = new Date(event.startDate);
          const endDate = new Date(event.endDate);

          if (!event.startDate) {
              event.status = 'upcoming';
          } else if (currentDate < startDate) {
              event.status = 'upcoming';
          } else if (event.endDate && currentDate > endDate) {
              event.status = 'past';
          } else {
              event.status = 'ongoing';
          }
          await event.save();
      });

      console.log('Les statuts des événements ont été mis à jour avec succès.');
  } catch (error) {
      console.error('Une erreur s\'est produite lors de la mise à jour des statuts des événements :', error);
  }
});

const getDistinctValues = async (field) => {
  try {
      const distinctValues = await Event.distinct(field);
      return distinctValues;
  } catch (error) {
      throw new Error(error.message);
  }
};

const getPastEventsWithUserParticipation = async (userId) => {
  try {
      // Date actuelle pour filtrer les événements passés
      const currentDate = new Date();

      // Requête pour obtenir les événements passés
      const pastEvents = await Event.find({ endDate: { $lt: currentDate } })
          .populate('attendeesUsers.userId', 'displayName email image'); // Populate pour obtenir les détails de l'utilisateur

      // Transformation des données pour inclure l'indicateur de participation
      const eventsWithParticipation = pastEvents.map(event => {
          const userParticipated = event.attendeesUsers.some(user => user.userId.equals(userId));
          return {
              ...event.toObject(),
              userParticipated
          };
      });

      return eventsWithParticipation;
  } catch (error) {
      throw new Error(error.message);
  }
};

async function getAllUpcommingEvents(userId) {
  try {
      const events = await Event.find({status : 'upcoming'});

      const eventsWithParticipation = events.map(event => {
          const userParticipated = event.attendeesUsers.some(user => user.userId.equals(userId));
          return {
              ...event.toObject(), 
              userParticipated    
          };
      });

      return eventsWithParticipation;
  } catch (error) {
      throw new Error('Error retrieving events: ' + error.message);
  }
}


// const getDistinctValuesByUser = async (userId, field) => {
//   try {
//     const userEvents = await Event.find({ 'attendeesUsers.userId': mongoose.Types.ObjectId(userId) });

//     // Extraire les valeurs du champ spécifié pour chaque événement
//     const fieldValues = userEvents.map(event => event[field]);

//     // Extraire les valeurs distinctes
//     const distinctValues = [...new Set(fieldValues.flat())];

//     return distinctValues;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

const getDistinctValuesByUser = async (field, userId) => {
  try {
      // Filtrer les événements auxquels l'utilisateur est inscrit
      const distinctValues = await Event.distinct(field, { 'attendeesUsers.userId': userId });
      return distinctValues;
  } catch (error) {
      throw new Error(error.message);
  }
};


module.exports = {
    createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, getAllEventsByUser, addAttendeeToEvent,
    supprimerCollection , addConnectedAttendee , updateConnectedAttendee , deleteConnectedAttendee , addPromoCode ,
    countEventsByUserId , getEventsForUser , getDistinctValues , getPastEventsWithUserParticipation ,
    getDistinctValuesByUser , createEventWithJson , searchParticipateEvents , searchUpcomingEvents ,
    searchPastEvents , getAllUpcommingEvents 
};