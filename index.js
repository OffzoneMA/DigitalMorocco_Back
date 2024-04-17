const express = require("express");
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
const session = require('express-session');
const { passport } = require("./config/passport-setup");
const { checkSubscriptionStatus } = require("./services/MemberService");

// Swagger Imports
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./config/swagger_config');

const specs = swaggerJsdoc(swaggerOptions);

//const authenticateJWT = require('./middelware/authenticateJWT'); // Import du middleware d'authentification

const app = express();

app.use(cors());


app.use(express.json({limit: "100mb"}));

app.use(express.static(path.join(__dirname, "images")))

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


const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { customCssUrl: CSS_URL }));



module.exports = app;
