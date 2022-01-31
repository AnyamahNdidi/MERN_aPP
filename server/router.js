const express = require("express")

const router = express.Router()
const ptUser = require("./Model")
const multer = require("multer")
const path = require("path")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { nextTick } = require("process")


router.get("/", async(req, res)=>{
  try{
    const getUser = await ptUser.find()

    res.status(200).json({
      message:"user found",
      // totalUser = getUser.length,
      data:getUser
    })
  }catch(error){
    res.status(400).json({mesage: error.message})
  }
})

router.get("/:id", async(req, res)=>{
  // const {id} = req.params
  try{
    const getUser = await ptUser.findById(req.params.id, req.body)

    res.status(200).json({
      message:"user found",
      // totalUser = getUser.length,
      data:getUser
    })
  }catch(error){
    res.status(400).json({mesage: error.message})
  }
})


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage }).single("image")

router.post("/register", upload, async(req, res)=>{
  const {userName,email,password, avatar} = req.body

  const saltPasswrod = await  bcrypt.genSalt(10)
  const haspassword = await bcrypt.hash(password, saltPasswrod)
   try{
     const createUser = await ptUser.create({
       userName,
       email,
       password:haspassword,
       avatar:req.file.path
     })

     res.status(200).json({data: createUser})
   }catch(error){
    res.status(400).json({mesage: error.message})
   }
})


router.post("/signin", async(req, res)=>{

   try{
    const {email} = req.body
    const user=  await ptUser.findOne({email})

    if(user){
      const checkPassword = await bcrypt.compare(req.body.password,
       user.password  
        );

        if(checkPassword){
          const {password, ...info} = user._doc;

          const token = jwt.sign(
            {
              id:user._id,
              email:user.email,
              userName:user.userName,
              isAdmin:user.isAdmin,
            },
            "bdjkvdjfvuldivhlui",
            {expiresIn:"1d"}
          )
          res.status(200).json({
             message: `welcome back ${user.userName}`,
             data:{...info, token}
          })

        }else{
          res.status(400).json({message :"incorrect passwrod"})
        }
    }else{
      res.status(400).json({message :"user not register"})
    }
   }catch(error){
    res.status(400).json({mesage: error.message})
   }
})


const verified = async (req, res, next)=>{
  
  try{
    const authToken = req.headers.authorization
    if(authToken){
      const token = authToken.split(" ")[2]

      jwt.verify(token,  "bdjkvdjfvuldivhlui", (error, payload )=>{
        if(error){
          res.status(400).json({message :"please check your token"})

        }else{
         req.user = payload
         next()
        }
      })


    }else{
       res.status(400).json({message:"something is wrong withbthis token"})
    }

  }catch(error){
    res.status(400).json({message: "you dont have the right to this operation"})
  }


}


router.patch("/user/:id", verified, async(req, res)=>{
  try{
   if( req.user.id === req.params.id || req.user.isAdmin){
    const user = await ptUser.findByIdAndUpdate(req.params.id,
     
      {userName:req.body.userName},

       {new:true}
     );
     res.status(200).json({ 
       message:"user updated",
       data:user})
   }

  }catch(error){
    res.status(400).json({mesage: error.message})
  }
})

router.delete("/user/:id", verified, async(req, res)=>{
  try{
   if(req.user.isAdmin){
    const user = await ptUser.findByIdAndDelete(req.params.id,
   req.body
     );
     res.status(200).json({ 
       message:"user deleted"})
   }else{
     res.status(400).json({
       message:"your are not an admin"
     })
   }

  }catch(error){
    res.status(400).json({mesage: error.message})
  }
})

module.exports = router