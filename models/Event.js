const mongoose = require("mongoose");

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
        required: true,
    },
    category: {
        type: String,
        enum: ['Workshop', 'Seminar', 'Conference', 'Other']
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
    organizerLogo: String,
    organizername: String,
    status:
    {
        type: String,
        enum: ['past', 'upcoming',],
        default: 'upcoming'
    },
    sponsors: [
        {
            logo: String,
            name: String
        }
    ]
})

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;