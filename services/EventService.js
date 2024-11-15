const Event = require('../models/Event');
const User = require('../models/User');
const EmailService = require('./EmailingService');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const uploadService = require('./FileService');
const cron = require('node-cron');
const Sponsor = require("../models/Sponsor"); 

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

const getEventByIdWithParticipate = async (eventId, userId) => {
  try {
    const event = await Event.findById(eventId).populate('attendeesUsers.userId', 'displayName email image');
    
    if (!event) {
      throw new Error('Event not found');
    }

    const userParticipated = event.attendeesUsers.some(user => user.userId.equals(userId));

    return {
      ...event.toObject(),
      userParticipated,
    };
  } catch (error) {
    throw new Error('Error retrieving event: ' + error.message);
  }
};

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


async function getEventsForUser(userId, args) {
  try {
    const requestedPage = parseInt(args?.page, 10) || 1;
    const pageSize = parseInt(args?.pageSize, 10) || 8;

    // Construire le filtre de recherche
    const query = { 'attendeesUsers.userId': userId };

    // Filtrage par physicalLocation
    if (args?.physicalLocation) {
      query.physicalLocation = { $regex: new RegExp(args.physicalLocation, 'i') };
    }

    // Filtrage par eventNames
    if (args?.eventNames) {
      const eventNamesArray = args.eventNames.split(',').map(name => name.trim()).filter(name => name.length > 0);
      if (eventNamesArray.length > 0) {
        query.$or = eventNamesArray.map(name => ({
          title: { $regex: new RegExp(name, 'i') },
        }));
      }
    }

    // Compte le total des événements correspondants pour la pagination
    const totalCount = await Event.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Assurer que `currentPage` est valide
    const currentPage = requestedPage > totalPages ? 1 : requestedPage;
    const skip = (currentPage - 1) * pageSize;

    // Récupérer les événements filtrés et paginés
    const events = await Event.find(query)
      .skip(skip)
      .limit(pageSize);

    return { events, totalPages, currentPage };
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events for user: ' + error.message);
  }
}

async function searchParticipateEvents(user, searchTerm) {
  try {
      const regex = new RegExp(searchTerm, 'i'); 

      const events = await Event.find({
          'attendeesUsers.userId': user?._id,
          $or: [
              { title: regex },       
              // { description: regex }, 
              // { physicalLocation: regex }   ,
              // {category: regex}  
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
              // { description: regex },
              // { summary: regex },
              // { category: regex },
              // { industry: regex }
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
              // { description: regex },
              // { summary: regex },
              // { category: regex },
              // { industry: regex }
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

const getDistinctValues = async (field, filter = {}) => {
  try {
    // Applique le filtre pour les événements (par exemple { status: 'upcoming' })
    const distinctValues = await Event.distinct(field, filter);
    return distinctValues;
  } catch (error) {
    throw new Error(error.message);
  }
};


const getPastEventsWithUserParticipation = async (userId, args) => {
  try {
    const page = args?.page || 1; 
    const pageSize = args?.pageSize || 8; 
    const skip = (page - 1) * pageSize; 

    // Date actuelle pour filtrer les événements passés
    const currentDate = new Date();

    const pastEvents = await Event.find({ endDate: { $lt: currentDate } })
      .populate('attendeesUsers.userId', 'displayName email image') 
      .skip(skip)
      .limit(pageSize); 

    // Transformation des données pour inclure l'indicateur de participation
    const eventsWithParticipation = pastEvents.map(event => {
      const userParticipated = event.attendeesUsers.some(user => user.userId.equals(userId));
      return {
        ...event.toObject(),
        userParticipated
      };
    });

    // Compter le total d'événements passés pour le calcul des pages
    const totalCount = await Event.countDocuments({ endDate: { $lt: currentDate } });
    const totalPages = Math.ceil(totalCount / pageSize); 

    return { events: eventsWithParticipation, totalPages };
  } catch (error) {
    throw new Error('Error retrieving past events: ' + error.message);
  }
};


async function getAllUpcommingEvents(userId, args) {
  try {
    const requestedPage = parseInt(args?.page, 10) || 1; 
    const pageSize = parseInt(args?.pageSize, 10) || 8; 
    const skip = (requestedPage - 1) * pageSize; 
    
    // Construire le filtre de base pour les événements à venir
    const filter = { status: 'upcoming' };
    
    // Ajouter le filtre par localisation si présent
    if (args?.location) {
      filter.physicalLocation = args.location;
    }

    // Ajouter le filtre par date de début si présent
    if (args.startDate && args?.startDate !== 'Invalid Date') {
      const startOfDay = new Date(args.startDate);
      startOfDay.setHours(0, 0, 0, 0); // Début de la journée
      const endOfDay = new Date(args.startDate);
      endOfDay.setHours(23, 59, 59, 999); // Fin de la journée

      filter.startDate = { $gte: startOfDay, $lte: endOfDay };
    }

    // Compter le nombre total d'événements correspondant aux critères de filtrage
    const totalCount = await Event.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Si la page demandée dépasse le nombre total de pages, définir la page à 1
    const currentPage = requestedPage > totalPages ? 1 : requestedPage;
    const finalSkip = (currentPage - 1) * pageSize;

    // Trouver les événements en appliquant les filtres
    const events = await Event.find(filter)
      .skip(finalSkip)
      .limit(pageSize);

    // Ajouter la participation de l'utilisateur
    const eventsWithParticipation = events.map(event => {
      const userParticipated = event.attendeesUsers.some(user => user.userId.equals(userId));
      return {
        ...event.toObject(),
        userParticipated    
      };
    });

    return { events: eventsWithParticipation, totalPages, currentPage };
  } catch (error) {
    throw new Error('Error retrieving events: ' + error.message);
  }
}

async function getAllUpcomingEventsWithSponsors(userId, partnerId, args) {
  try {
    const requestedPage = parseInt(args?.page, 10) || 1;
    const pageSize = parseInt(args?.pageSize, 10) || 8;
    const skip = (requestedPage - 1) * pageSize;

    // Base filter for upcoming events
    const filter = { status: 'upcoming' };

    // Add location filter if present
    if (args?.location) {
      filter.physicalLocation = args.location;
    }

    // Add start date filter if present
    if (args.startDate && args?.startDate !== 'Invalid Date') {
      const startOfDay = new Date(args.startDate);
      startOfDay.setHours(0, 0, 0, 0); // Start of the day
      const endOfDay = new Date(args.startDate);
      endOfDay.setHours(23, 59, 59, 999); // End of the day

      filter.startDate = { $gte: startOfDay, $lte: endOfDay };
    }

    // Count total events for pagination
    const totalCount = await Event.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Ensure currentPage is valid
    const currentPage = requestedPage > totalPages ? 1 : requestedPage;
    const finalSkip = (currentPage - 1) * pageSize;

    // Fetch events based on filters and pagination
    const events = await Event.find(filter)
      .skip(finalSkip)
      .limit(pageSize);

    // Add participation and sponsor status fields
    const eventsWithDetails = await Promise.all(events.map(async (event) => {
      // Check if the user participated
      const userParticipated = event.attendeesUsers.some(user => user.userId.equals(userId));

      // Check if the partner has sent a sponsor request for this event
      const sponsorRequest = await Sponsor.findOne({
        partnerId,
        eventId: event._id,
        requestType: 'Sent'
      });
      const partnerHasSentRequest = !!sponsorRequest;

      // Check if the partner has approved at least one sponsorship request for this event
      const approvedSponsorship = await Sponsor.findOne({
        partnerId,
        eventId: event._id,
        status: 'Approved'
      });
      const partnerHasApprovedSponsorship = !!approvedSponsorship;

      // Return event with added fields
      return {
        ...event.toObject(),
        userParticipated,
        partnerHasSentRequest,
        partnerHasApprovedSponsorship
      };
    }));

    return { events: eventsWithDetails, totalPages, currentPage };
  } catch (error) {
    throw new Error('Error retrieving events: ' + error.message);
  }
}

async function getAllUpcomingEventsWithSponsorsNotSent(userId, partnerId, args) {
  try {
    const requestedPage = parseInt(args?.page, 10) || 1;
    const pageSize = parseInt(args?.pageSize, 10) || 8;

    // Base filter for upcoming events
    const filter = { status: 'upcoming' };

    // Add location filter if present
    if (args?.location) {
      filter.physicalLocation = args.location;
    }

    // Add start date filter if present
    if (args?.startDate && args?.startDate !== 'Invalid Date') {
      const startOfDay = new Date(args.startDate);
      startOfDay.setHours(0, 0, 0, 0); // Start of the day
      const endOfDay = new Date(args.startDate);
      endOfDay.setHours(23, 59, 59, 999); // End of the day

      filter.startDate = { $gte: startOfDay, $lte: endOfDay };
    }

    // Fetch all upcoming events matching the filter
    const allEvents = await Event.find(filter);

    // Filter out events where the partner has already sent a sponsor request
    const eventsWithoutSentRequest = await Promise.all(
      allEvents.map(async (event) => {
        const sponsorRequest = await Sponsor.findOne({ partnerId, eventId: event._id, requestType: 'Sent' });

        // If the partner has NOT sent a sponsor request, process the event
        if (!sponsorRequest) {
          const userParticipated = event.attendeesUsers.some(user => user.userId.equals(userId));

          // Check if the partner has approved at least one sponsorship request for this event
          const approvedSponsorship = await Sponsor.findOne({
            partnerId,
            eventId: event._id,
            status: 'Approved',
          });
          const partnerHasApprovedSponsorship = !!approvedSponsorship;

          return {
            ...event.toObject(),
            userParticipated,
            partnerHasSentRequest: false,
            partnerHasApprovedSponsorship,
          };
        }
        return null;
      })
    );

    // Remove null values
    const filteredEvents = eventsWithoutSentRequest.filter(event => event !== null);

    // Calculate pagination
    const totalCount = filteredEvents.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Ensure `currentPage` is valid
    const currentPage = requestedPage > totalPages ? 1 : requestedPage;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + pageSize);

    return { events: paginatedEvents, totalPages, currentPage };
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

async function getDistinctFieldValuesForUpcomingEventsNotSent(partnerId, field) {
  try {
    // Base filter for upcoming events
    const filter = { status: 'upcoming' };
    // Fetch all upcoming events based on filters
    const events = await Event.find(filter).lean();
    // Filter out events where the partner has already sent a sponsor request
    const eventsWithoutSentRequest = await Promise.all(events.map(async (event) => {
      const sponsorRequest = await Sponsor.findOne({ partnerId, eventId: event._id, requestType: 'Sent' });
      return !sponsorRequest ? event : null; // Return event if no sponsor request found
    }));

    // Filter out any null values
    const validEvents = eventsWithoutSentRequest.filter(event => event !== null);
    // Retrieve distinct values for the specified field
    const distinctValues = [...new Set(validEvents.map(event => event[field]))];
    return { distinctValues };
  } catch (error) {
    throw new Error('Error retrieving distinct field values: ' + error.message);
  }
}


module.exports = {
    createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, getAllEventsByUser, addAttendeeToEvent,
    supprimerCollection , addConnectedAttendee , updateConnectedAttendee , deleteConnectedAttendee , addPromoCode ,
    countEventsByUserId , getEventsForUser , getDistinctValues , getPastEventsWithUserParticipation ,
    getDistinctValuesByUser , createEventWithJson , searchParticipateEvents , searchUpcomingEvents ,
    searchPastEvents , getAllUpcommingEvents , getEventByIdWithParticipate , getAllUpcomingEventsWithSponsors , 
    getAllUpcomingEventsWithSponsorsNotSent , getDistinctFieldValuesForUpcomingEventsNotSent
};