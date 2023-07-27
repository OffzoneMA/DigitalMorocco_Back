const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();



const Userouter = require("./routes/Userouter");
const Adminrouter = require("./routes/Adminrouter");
const Requestouter = require("./routes/Requestrouter");
const storage = require("./config/FireStorage");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(result => {
        // Start the server after successful database connection
        app.listen(process.env.PORT, () => {
            console.log("Server is running!");
        });
    })
    .catch(err => console.log(err));

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/users", Userouter);
app.use("/admin", Adminrouter);
app.use("/requests", Requestouter);



module.exports = app;
