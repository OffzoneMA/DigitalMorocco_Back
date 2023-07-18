const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")
const Userouter = require("./routes/Userouter")
const Adminrouter = require("./routes/Adminrouter")
const Requestouter = require("./routes/Requestrouter")

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

app.use("/users", Userouter)
app.use("/admin", Adminrouter)
app.use("/requests", Requestouter)





module.exports=app

