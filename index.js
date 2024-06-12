const express = require("express");
const i18n = require('i18next');
const Backend = require('i18next-node-fs-backend');
const i18nextMiddleware = require('i18next-express-middleware');
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path')
require("dotenv").config();
const Userouter = require("./routes/Userrouter");
const MemberRouter = require("./routes/MemberRouter");
const PartnerRouter = require("./routes/PartnerRouter");
const InvestorRouter = require("./routes/InvestorRouter");
const Adminrouter = require("./routes/Adminrouter");
const Requestouter = require("./routes/Requestrouter");
const SubscriptionRouter = require("./routes/SubscriptionRouter");
const UserLogRouter = require("./routes/UserLogRouter");
const SubscriptionLogRouter = require("./routes/SubscriptionLogRouter");
const EventRouter = require("./routes/EventRouter")
const BlogRouter = require("./routes/BlogRouter")
const OtpRouter = require("./routes/Otprouter")
const ProjectRouter = require("./routes/ProjectRouter")
const FileRouter = require('./routes/FileRouter')
const VerifyRouter = require('./routes/VerifyRouter')
const NewsletterRouter = require('./routes/NewsletterRouter')
const session = require('express-session');
const { passport } = require("./config/passport-setup");
const { checkSubscriptionStatus } = require("./services/MemberService");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const Event = require('./models/Event');

// Swagger Imports
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./config/swagger_config');

const specs = swaggerJsdoc(swaggerOptions);

const app = express();

app.use(cors());


app.use(express.json({limit: "100mb"}));

app.use(express.static(path.join(__dirname, "images")))

app.use(cookieParser());
app.use(bodyParser.json());

i18n
  .use(Backend)
//   .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
        loadPath: path.resolve("./locales/{{lng}}/{{ns}}.json")
    },
    fallbackLng: 'en',
    preload: ['en', 'fr'],
    detection: {
      order: ['header', 'querystring', 'cookie'],
      caches: ['cookie'],
    },
    localePath: path.resolve("./locales"),
  });

app.use(i18nextMiddleware.handle(i18n));

// app.use((req, res, next) => {
//     res.locals.t = req.t;
//     next();
//   });

i18n.changeLanguage('fr');

  app.get('/', (req, res) => {
    const response = `${i18n.t('welcome_email.title')} ${i18n.t('welcome_email.title1')}`;
    res.status(200);
    res.send(response);
  });


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL ,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        // Start the server after successful database connection
        app.listen(process.env.PORT, () => {
            console.log("Server is running!");
            app.use(passport.initialize());
            app.use(passport.session());
            //Checking the subscription expire date (For all members) every 24Hr
            const taskInterval = 24 * 60 * 60 * 1000; 
            setInterval(checkSubscriptionStatus, taskInterval);
            // const events = [
            //   {
            //     title: "Past Tech Summit",
            //     description: "An annual summit on technology.",
            //     summary: "Discuss the future of technology.",
            //     promoCode: "PASTTECH2024",
            //     promoCodes: [
            //       {
            //         code: "PASTTECH2024",
            //         discountPercentage: 10,
            //         minOrderAmount: 50,
            //         valid: true,
            //         validUntil: new Date('2024-12-31')
            //       }
            //     ],
            //     startDate: new Date('2023-05-01T09:00:00'),
            //     endDate: new Date('2023-05-01T17:00:00'),
            //     startTime: "09:00 AM",
            //     endTime: "17:00 PM",
            //     locationType: "physical",
            //     category: "Conference",
            //     industry: "Technology",
            //     physicalLocation: "789 Tech Road, Innovation City",
            //     latitude: 37.7749,
            //     longitude: -122.4194,
            //     creator: "665f1ac2ef43b11bd8d3a1d2", // Utilisez un ObjectId valide ici
            //     headerImage: "https://example.com/image4.jpg",
            //     image: "https://example.com/image4.jpg",
            //     tags: ["tech", "summit"],
            //     youtubeVideo: "https://youtube.com/video4",
            //     zoomLink: "https://zoom.us/j/123450987",
            //     zoomMeetingID: "123450987",
            //     zoomPasscode: "pasttech2024",
            //     price: 150,
            //     salesEndDate: new Date('2023-04-30'),
            //     availableQuantity: 50,
            //     attendees: [],
            //     attendeesUsers: [],
            //     organizerLogo: "https://example.com/logo4.png",
            //     organizername: "Tech Summit Org",
            //     status: "past",
            //     sponsors: [
            //       {
            //         logo: "https://example.com/sponsor4.png",
            //         name: "Tech Sponsor"
            //       }
            //     ]
            //   },
            //   {
            //     title: "Past Business Meetup",
            //     description: "A meetup for business professionals.",
            //     summary: "Network with business professionals.",
            //     promoCode: "PASTBIZ2024",
            //     promoCodes: [
            //       {
            //         code: "PASTBIZ2024",
            //         discountPercentage: 15,
            //         minOrderAmount: 100,
            //         valid: true,
            //         validUntil: new Date('2024-12-31')
            //       }
            //     ],
            //     startDate: new Date('2023-06-10T10:00:00'),
            //     endDate: new Date('2023-06-10T14:00:00'),
            //     startTime: "10:00 AM",
            //     endTime: "14:00 PM",
            //     locationType: "online",
            //     category: "Meetup",
            //     industry: "Business",
            //     physicalLocation: "",
            //     latitude: null,
            //     longitude: null,
            //     creator: "665f1ac2ef43b11bd8d3a1d2", // Utilisez un ObjectId valide ici
            //     headerImage: "https://example.com/image5.jpg",
            //     image: "https://example.com/image5.jpg",
            //     tags: ["business", "meetup"],
            //     youtubeVideo: "https://youtube.com/video5",
            //     zoomLink: "https://zoom.us/j/543216789",
            //     zoomMeetingID: "543216789",
            //     zoomPasscode: "pastbiz2024",
            //     price: 50,
            //     salesEndDate: new Date('2023-06-09'),
            //     availableQuantity: 75,
            //     attendees: [],
            //     attendeesUsers: [],
            //     organizerLogo: "https://example.com/logo5.png",
            //     organizername: "Business Meetup Org",
            //     status: "past",
            //     sponsors: [
            //       {
            //         logo: "https://example.com/sponsor5.png",
            //         name: "Business Sponsor"
            //       }
            //     ]
            //   },
            //   {
            //     title: "Tech Workshop",
            //     description: "A workshop on the latest tech trends.",
            //     summary: "Learn about the latest in technology.",
            //     promoCode: "TECH2024",
            //     promoCodes: [
            //       {
            //         code: "TECH2024",
            //         discountPercentage: 10,
            //         minOrderAmount: 50,
            //         valid: true,
            //         validUntil: new Date('2024-12-31')
            //       }
            //     ],
            //     startDate: new Date('2024-07-01T09:00:00'),
            //     endDate: new Date('2024-07-01T17:00:00'),
            //     startTime: "09:00 AM",
            //     endTime: "17:00 PM",
            //     locationType: "physical",
            //     category: "Workshop",
            //     industry: "Technology",
            //     physicalLocation: "123 Tech Street, Tech City",
            //     latitude: 37.7749,
            //     longitude: -122.4194,
            //     creator: "665f1ac2ef43b11bd8d3a1d2", // Utilisez un ObjectId valide ici
            //     headerImage: "https://example.com/image1.jpg",
            //     image: "https://example.com/image1.jpg",
            //     tags: ["tech", "workshop"],
            //     youtubeVideo: "https://youtube.com/video1",
            //     zoomLink: "https://zoom.us/j/123456789",
            //     zoomMeetingID: "123456789",
            //     zoomPasscode: "tech2024",
            //     price: 100,
            //     salesEndDate: new Date('2024-06-30'),
            //     availableQuantity: 100,
            //     attendees: [],
            //     attendeesUsers: [],
            //     organizerLogo: "https://example.com/logo1.png",
            //     organizername: "Tech Corp",
            //     status: "upcoming",
            //     sponsors: [
            //       {
            //         logo: "https://example.com/sponsor1.png",
            //         name: "Tech Sponsor"
            //       }
            //     ]
            //   },
            //   {
            //     title: "Business Seminar",
            //     description: "A seminar on business strategies.",
            //     summary: "Explore new business strategies.",
            //     promoCode: "BUSINESS2024",
            //     promoCodes: [
            //       {
            //         code: "BUSINESS2024",
            //         discountPercentage: 15,
            //         minOrderAmount: 100,
            //         valid: true,
            //         validUntil: new Date('2024-12-31')
            //       }
            //     ],
            //     startDate: new Date('2024-08-15T10:00:00'),
            //     endDate: new Date('2024-08-15T16:00:00'),
            //     startTime: "10:00 AM",
            //     endTime: "16:00 PM",
            //     locationType: "online",
            //     category: "Seminar",
            //     industry: "Business",
            //     physicalLocation: "",
            //     latitude: null,
            //     longitude: null,
            //     creator: "665f1ac2ef43b11bd8d3a1d2", // Utilisez un ObjectId valide ici
            //     headerImage: "https://example.com/image2.jpg",
            //     image: "https://example.com/image2.jpg",
            //     tags: ["business", "seminar"],
            //     youtubeVideo: "https://youtube.com/video2",
            //     zoomLink: "https://zoom.us/j/987654321",
            //     zoomMeetingID: "987654321",
            //     zoomPasscode: "business2024",
            //     price: 200,
            //     salesEndDate: new Date('2024-08-14'),
            //     availableQuantity: 200,
            //     attendees: [],
            //     attendeesUsers: [],
            //     organizerLogo: "https://example.com/logo2.png",
            //     organizername: "Business Inc",
            //     status: "upcoming",
            //     sponsors: [
            //       {
            //         logo: "https://example.com/sponsor2.png",
            //         name: "Business Sponsor"
            //       }
            //     ]
            //   },
            //   {
            //     title: "Health Conference",
            //     description: "A conference on health and wellness.",
            //     summary: "Join us for a discussion on health and wellness.",
            //     promoCode: "HEALTH2024",
            //     promoCodes: [
            //       {
            //         code: "HEALTH2024",
            //         discountPercentage: 20,
            //         minOrderAmount: 150,
            //         valid: true,
            //         validUntil: new Date('2024-12-31')
            //       }
            //     ],
            //     startDate: new Date('2024-09-20T08:00:00'),
            //     endDate: new Date('2024-09-20T18:00:00'),
            //     startTime: "08:00 AM",
            //     endTime: "18:00 PM",
            //     locationType: "physical",
            //     category: "Conference",
            //     industry: "Health",
            //     physicalLocation: "456 Health Avenue, Wellness City",
            //     latitude: 34.0522,
            //     longitude: -118.2437,
            //     creator: "665f1ac2ef43b11bd8d3a1d2", // Utilisez un ObjectId valide ici
            //     headerImage: "https://example.com/image3.jpg",
            //     image: "https://example.com/image3.jpg",
            //     tags: ["health", "conference"],
            //     youtubeVideo: "https://youtube.com/video3",
            //     zoomLink: "https://zoom.us/j/654321987",
            //     zoomMeetingID: "654321987",
            //     zoomPasscode: "health2024",
            //     price: 300,
            //     salesEndDate: new Date('2024-09-19'),
            //     availableQuantity: 300,
            //     attendees: [],
            //     attendeesUsers: [],
            //     organizerLogo: "https://example.com/logo3.png",
            //     organizername: "Health Org",
            //     status: "upcoming",
            //     sponsors: [
            //       {
            //         logo: "https://example.com/sponsor3.png",
            //         name: "Health Sponsor"
            //       }
            //     ]
            //   }
            // ]

            // Event.insertMany(events)
            // .then(() => {
            //   console.log('Events inserted successfully');
            //   mongoose.connection.close();
            // })
            // .catch((error) => {
            //   console.error('Error inserting events:', error);
            //   mongoose.connection.close();
            // });
        });
    })
    .catch(err => console.log(err));

app.use(
    session({
        secret: process.env.ACCESS_TOKEN_SECRET,
        resave: true,
        saveUninitialized: true,
    })
);

// Applique le middleware d'authentification à toutes les routes nécessitant une authentification
//app.use(authenticateJWT);

// Routes
app.use("/users", Userouter);
app.use("/verify", VerifyRouter);
app.use("/members", MemberRouter);
app.use("/partners", PartnerRouter);
app.use("/investors", InvestorRouter);
app.use("/admin", Adminrouter);
app.use("/requests", Requestouter);
app.use("/subscriptions", SubscriptionRouter);
app.use("/logs", UserLogRouter);
app.use("/Sublogs", SubscriptionLogRouter);
app.use("/events", EventRouter);
app.use("/blogs", BlogRouter);
app.use("/users/otp", OtpRouter);
app.use("/projects", ProjectRouter);
app.use("/files", FileRouter);
app.use("/newsletter" , NewsletterRouter)


const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { customCssUrl: CSS_URL }));



module.exports = app;
