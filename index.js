const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")
const userouter = require("./routes/userouter")

const app = express();

require("dotenv").config();
app.use(express.json())
app.use(cors());

mongoose.connect(process.env.MONGO_URL)
    .then(result => {
        app.listen(process.env.PORT, () => {
            console.log("Server is running ! ");
        })
        
    })
    .catch(err => console.log(err))

app.use("/users", userouter)





module.exports=app

