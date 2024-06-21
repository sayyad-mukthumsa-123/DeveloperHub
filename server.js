const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userModel = require('./models/userModel');
const reviewModel = require('./models/reviewModel');
const jwt = require("jsonwebtoken");
const middleware = require("./middleware/middleware");
//Initialize express
const app = express();
//
app.use(express.json());
//
app.use(cors({ origin: '*' }));

//routers
//home
app.get("/", (req, res) => {
    // res.json({msg:"hello"});
    res.send("hello world")
})
mongoose.connect("mongodb+srv://mukthumsasayyad2003:Mukthumsa662003@cluster0.zpxxxbh.mongodb.net/users?retryWrites=true&w=majority&appName=Cluster0").then(
    () => {
        console.log("db connected successfully");
    }
)
//register
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
//login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const userExist = await userModel.findOne({ email });
        if (userExist) {
            //const isPassword=await userModel.findOne({password});
            if (userExist.password === password) {
                let payload = {
                    user:
                    {
                        id: userExist.id
                    }
                }
                jwt.sign(payload, "jwtpassword", { expiresIn: 360000000 }, (err, token) => {
                    if (err) throw err;
                    return res.json({ token, msg: "user login successful" });
                });
                //return res.status(200).json({msg:"user login successful"});
            }
            else {
                return res.status(403).json({ msg: "Invalid credentials" });
            }
        }
        else {
            return res.status(403).json({ msg: "Invalid credentials" });
        }
    }
    catch (error) {
        return res.status(500).json({ msg: "Error:" + error });
    }
})
//allprofiles
app.get("/allprofiles", middleware, async (req, res) => {
    try {
        let allprofiles = await userModel.find();
        return res.json({ allprofiles });
    }
    catch (error) {
        return res.status(500).json({ msg: "Error:" + error });
    }
})
//myprofile
app.get("/myprofile", middleware, async (req, res) => {
    try {
        let user = await userModel.findById(req.user.id);
        return res.status(400).json({ user });
    }
    catch (error) {
        return res.status(500).json({ msg: "Error:" + error });
    }
})
//addreview
app.post("/addreview", middleware, async (req, res) => {
    try {
        const { taskworker, rating } = req.body;
        const exist = await userModel.findById(req.user.id);
        const newReview = new reviewModel({
            taskprovider: exist.fullname,
            taskworker, rating
        })
        newReview.save();
        return res.status(200).json({ msg: "Review added successfully" });
    }
    catch (error) {
        return res.status(500).json({ msg: "Error:" + error });
    }
})
//myreview
app.get("/myreview", middleware, async (req, res) => {
    try {
        let allreviews = await reviewModel.find();
        let myreview = allreviews.filter(review => review.taskworker.toString() === req.user.id.toString());
        return res.status(200).json({ myreview });
    }
    catch (error) {
        return res.status(500).json({ msg: "Error:" + error });
    }
})

//server listening        
app.listen(5000, () => {
    console.log("server running");
})