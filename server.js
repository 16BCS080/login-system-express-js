if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// @CELL -1 -default
const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const {MongoClient} = require("mongodb");

// @CELL -2 -developed
// #initilize of passport configiguration 
const initializePassport = require('./passport-config')

const app = express();
const port = 3000;
const uri = "mongodb+srv://js-mongo-db:9OiQI6hIF1Pgxn1N@cluster0.vivhzz6.mongodb.net/loginsystem?retryWrites=true&w=majority";
let db
let users = []


// SET and USE 
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: "process.env.SESSION_SECRET",
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//#CELL-3 FUNCTION CALLS
//db insert loged user
const loguser_into_db = async (user_info) => {
  db.collection("users").insertOne(user_info); 
}

//initializePassport
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

async function start() { 
  const client =new MongoClient(uri);
  await client.connect()
  db = client.db("loginsystem")
  users = await db.collection("users").find().toArray();
  console.log(users)
  console.log("DB SERVER CONNECTED")
  app.listen(port, () => {
    console.log(` SERVER APP LISTENING ON PORT ${port}`);
  } );
}


//#CELL-4 URL
app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', {  users : users  }) 
})
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))
app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    let user_data = {
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    };
    users.push(user_data); 
    loguser_into_db(user_data);
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})
app.delete('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})
start()