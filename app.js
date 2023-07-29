require("dotenv").config();
require("./config/database").connect();
const express = require("express");
var bcrypt = require('bcryptjs');
var jwt=require('jsonwebtoken');
const auth=require('./middleware/auth');
var randtoken=require('rand-token');
var refreshTokens={};

const app = express();

app.use(express.json());

// Logic goes here
// importing user context
const User = require("./model/user");

// Register
/**
From the /register route, we will:
1-Get user input.
2-Validate user input.
3-Validate if the user already exists.
4-Encrypt the user password.
5-Create a user in our database.
6-And finally, create a signed JWT token.*/
app.post("/register", async (req, res) => {

  // Our register logic starts here
  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
        res.status(400).json({"error":"All input is required"});
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).json({"error":"User Already Exist. Please singup with new email "});
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Finally Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });
    console.log("Time to save token ");
    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;
    user.password="****";
    console.log("Time to return the saved user back to client");
    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

// Login
/** 
For the /login route, we will:

1-Get user input.
2-Validate user input.
3-Validate if the user exists.
4-Verify user password against the password we saved earlier in our database.
5-And finally, create a signed JWT token.
*/
app.post("/login", async (req, res) => {

  // Our login logic starts here
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
         res.status(400).json({"error":"All input is required"});
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "1m",
        }
      );

      // save user token
      user.token = token;
      var refreshToken=randtoken.uid(256);
      //save in memory 
      refreshTokens[refreshToken]=user.email;

      // user
      user.password="****";
      console.log("REFRESHTOKEN---->"+refreshToken);
      res.status(200).json({'user':user,'refreshToken':refreshToken});
    }
    return res.status(409).json({"error":"Invalid credentials"});
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});



///WElCOME ROUTE have auth as middle ware 

app.post("/welcome", auth, (req, res) => {
    res.status(200).json({"body":"Welcome 🙌 to the Authenticated dashboard "});
  });



///refreshtoken route for practice purpose 
app.post("/token",(req,res)=>{
    var userid=req.body.id;
    var email=req.body.email;
    var refreshToken=req.body.refreshToken;
    console.log(refreshToken in refreshTokens);
    console.log(refreshTokens[refreshToken]==email);
    //the shirt for this below condition is server must running up and not restart other wise the memory will loss
    if((refreshToken in refreshTokens)&& (refreshTokens[refreshToken]==email)){
        console.log("SATISFIED");
        const token = jwt.sign(
            { user_id: userid, email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "3m",
            }
          );
          res.status(201).json({'accessToken':token});
    }else{
        return res.status(401).json({"error":"Invalid token"});
    }
});



///reject disable some refreshtoken

app.post("/token/reject/",(req,res,next)=>{
var refreshtoken=req.body.refreshToken;
if(refreshtoken in refreshTokens){
    delete refreshTokens[refreshtoken]
}
res.status(201).json({'msg':"Refreshtoken Deleted"});
});

module.exports = app;