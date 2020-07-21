const express = require("express");
const multer = require("multer");

const methodOverride = require("method-override");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");

const app = express();

const passport = require("./lib/passportConfig"); 
const session = require("express-session");
const flash = require("connect-flash");
const checkUser = require("./lib/checkUser");

require("dotenv").config();

app.use(methodOverride("_method"));

/* 
===================
Connect to MongoDB 
*/
mongoose.connect(
  process.env.MONGODBURL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => {
    console.log("MongoDB connected!");
  }
);

// adding custom files like css, js, img - look for static files in public folder
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true })); //collects form data
app.set("view engine", "ejs"); //view engine setup
app.use(expressLayouts);

// must come after above middleware
app.use(
  session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge : 360000 },
  })
)

// must come after sessions
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// set global variable for ejs files
app.use(function(req, res, moveOn){
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  moveOn();
})

//all routes
app.use("/", require("./routes/dashboard.route"));
app.use("/auth", require("./routes/auth.route"));
app.use("/user", checkUser, require("./routes/user.route"));
app.use("/category", checkUser, require("./routes/category.route"));

//connect to port
app.listen(process.env.PORT, () => {
  console.log(`running on PORT ${process.env.PORT}`);
});
