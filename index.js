
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const Userouter = require("./routes/Userrouter");
const MemberRouter = require("./routes/MemberRouter");
const Adminrouter = require("./routes/Adminrouter");
const Requestouter = require("./routes/Requestrouter");
const SubscriptionRouter = require("./routes/SubscriptionRouter");
const session = require('express-session');
const { passport } = require("./config/passport-setup");


const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(result => {
        // Start the server after successful database connection
        app.listen(process.env.PORT, () => {
            console.log("Server is running!");
            app.use(passport.initialize());
            app.use(passport.session());
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



// Routes
app.use("/users", Userouter);
app.use("/members", MemberRouter);
app.use("/admin", Adminrouter);
app.use("/requests", Requestouter);
app.use("/subscriptions", SubscriptionRouter);



module.exports = app;
