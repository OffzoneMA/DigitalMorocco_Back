const mongoose = require("mongoose");
const EventPromoCodeSchema = new mongoose.Schema({
    code: {
      type: String,
    //   required: true,
    },
    discountPercentage: {
      type: Number,
    //   required: true
    },
    minOrderAmount: {
      type: Number,
      default: 0
    },
    valid: {
      type: Boolean,
      default: true
    },
    validUntil: {
        type: Date,
        // required: true
    }
  });  
  
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    promoCode: String,
    promoCodes: [EventPromoCodeSchema],
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date
    },
    startTime: {
        type: String,
    },
    endTime: {
        type: String,
    },
    locationType: {
        type: String,
        enum: ['online', 'physical'],
        default: 'online'
    },
    category: {
        type: String,
        enum: ['Workshop', 'Seminar', 'Conference', 'Meetup' , 'Networking', 'Other']
    },
    industry: String,
    physicalLocation: String,
    latitude:Number,
    longitude:Number,
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    headerImage: {
        type: String
    },
    image: {
        type: String
    },
    tags: [
        {
            type: String
        }
    ],
    youtubeVideo: {
        type: String
    },
    zoomLink: {
        type: String
    },
    zoomMeetingID: {
        type: String
    },
    zoomPasscode: {
        type: String
    },
    price: {
        type: Number,
        default:0
    },
    
    salesEndDate:Date,
    availableQuantity: Number,
    attendees: [
        {
            firstName: {
                type: String,
                required: true
            },
            phoneNumber: String,
            jobTitle: String,
            city: String,
            lastName: {
                type: String,
                required: true
            },
            emailAddress: {
                type: String,
                required: true
            },
            companyName: String,
            country: String
        }
    ],
    attendeesUsers : [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
              },
              role: {
                type: String,
                enum: ['investor', 'member', 'partner'],
                required: true
              }
        }
    ],
    organizerLogo: String,
    organizername: String,
    status:
    {
        type: String,
        enum: ['past', 'upcoming', 'ongoing'],
        default: 'upcoming'
    },
    sponsors: [
        {
            logo: String,
            name: String
        }
    ],
    sponsorsRequests: [String] ,
    sponsorsPartners : [String],
})

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;