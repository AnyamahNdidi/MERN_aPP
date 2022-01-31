const mongoose  = require("mongoose")

const schmeUser = mongoose.Schema({
  userName:{
    type:String,
    require:true
  },
  email:{
    type:String,
    require:true
  },
  password:{
    type:String,
    require:true
  },
  avatar:{
    type:String,
    require:true
  },
  isAdmin:{
    type:Boolean,
    default:false
  }
})

const ptUser = mongoose.model("ptUser", schmeUser)

module.exports = ptUser

