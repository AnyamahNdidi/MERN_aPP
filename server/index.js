const express = require('express')
// const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors')
const myRouter = require("./router")
const path = require("path")

const port = 4000
const app = express()

const url = "mongodb://localhost/peted"

mongoose.connect(url).then(()=>{
  console.log("connect sucessfully");
})

app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors())
app.use("/api",require("./router") )


// app.get("/", (req, res)=>{
//   res.send("welcome to my api")
// })

app.listen(port , ()=>{
  console.log("port is running" + port);
})

