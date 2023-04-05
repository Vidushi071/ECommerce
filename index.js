if(process.env.NODE_ENV != "production")
{
  require("dotenv").config({path : "./config.env"})
}

const express = require("express");
const path = require("path")
const engine = require("ejs-mate")
const app = express();
// const PORT = 3000;
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const User = require("./models/User");
const passport = require("passport")
const LocalStrategy = require("passport-local")
const session = require("express-session")
const flash = require("connect-flash");

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/shopping-cart"
const port = process.env.PORT || 5000
const secret = process.env.SESSION_SECRET || 'This is secret session 123'

//Connect to DB
mongoose.connect(dbUrl,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=> console.log(" DB CONNECTED!"))
.catch((err)=> console.log(err));



const sessionflash = {
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {

      httpOnly:true,
      expires: Date.now()  + 7 *24*60*60*1000
    }
  };

  
  app.use(session(sessionflash))
  app.use(flash());
  app.use(passport.authenticate('session'));


  app.use((req, res, next) => {

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();

  });  

// All Product Routes
const productRouter = require("./routes/productRoutes");

//Review Routes

const reviewRouter = require("./routes/reviewRoutes")

// Auth router
const authRouter = require('./routes/authRoutes')

// Middlewares
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.engine("ejs", engine)
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views" ))
app.use(express.static(path.join(__dirname,'public')))



// passport
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());






// home route
app.get("/", (req,res)=>{

    res.render("index")
})



// Routers
app.use( productRouter);  // using router
app.use(reviewRouter);
app.use(authRouter);



app.listen(port, ()=>{

    console.log(` server running at port ${port}`)
})