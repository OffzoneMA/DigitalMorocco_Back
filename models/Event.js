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
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    locationType: {
        type: String,
        enum: ['online', 'physical'],
        required: true,
    },
    eventType: String,
    industry: String,
    physicalLocation: String,
    coordinates: {
        latitude:Number,
        longitude:Number,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        //required: true
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
    ticketInfo: {
        price: {
            type: Number,
            required: true
        },
        
        salesEndDate:Date,
        availableQuantity:Number,
    },
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
    Organizeby: {
        logo: String,
        name: String,
    },
    status:
    {
        type: String,
        enum: ['past', 'upcoming',],
        default: 'upcoming'
    },
    sponsors: [
        {
            
        }
    ]
})

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;