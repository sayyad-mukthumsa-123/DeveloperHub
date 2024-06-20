const express = require('express');
const mongoose = require('mongoose');
const userModel = require('./models/userModel');
const jwt=require("jsonwebtoken");
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
    // res.json({msg:"hello"});
    res.send("hello world")
})
mongoose.connect("mongodb+srv://mukthumsasayyad2003:Mukthumsa662003@cluster0.zpxxxbh.mongodb.net/users?retryWrites=true&w=majority&appName=Cluster0").then(
    () => {
        console.log("db connected successfully");
    }
)
app.post("/register", async (req, res) => {
    try {
        const { fullname, email, mobile, skill, password, confirmpassword } = req.body;
        const userExist = await userModel.findOne({ email: email });
        if (userExist)
            return res.status(400).json({ msg: "User already exists" });
        if (password != confirmpassword)
            return res.status(403).json({ msg: "Invalid password" });
        let newUser = new userModel(
            {
                fullname, email, mobile, skill, password, confirmpassword
            }
        )
        await newUser.save();
        return res.status(200).json({ msg: "User registered successfully" });
    }
    catch (error) {
        return res.status(500).json({ msg: "Error:" + error });
    }
})
app.post("/login",async (req,res)=>
{
    try
    {
        const {email,password}=req.body;
        const userExist=await userModel.findOne({email});
        if(userExist){
            //const isPassword=await userModel.findOne({password});
            if(userExist.password===password)
                {
                    let payload={
                        user:
                        {
                            id:userExist.id
                        }
                    }
                    jwt.sign(payload,"jwtpassword",{expiresIn:360000000},(err,token)=>
                    {
                        if(err)throw err;
                        return res.json({token,msg:"user login successful"});
                    });
                    //return res.status(200).json({msg:"user login successful"});
                }
                else{
                    return res.status(403).json({msg:"Invalid credentials"});
                }
        }
        else{
            return res.status(403).json({msg:"Invalid credentials"});
        }
    }
    catch(error)
    {
        res.status(500).json({msg:"Error:"+error});
    }
})
app.listen(5000, () => {
    console.log("server running");
})