if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

//base call 
const express = require('express')
const app = express()

//session and prodection
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

//db
const dbConn = require('./components/database')
const alog = (user_info) => { 
  dbConn.then(function(db) {
  var dbo = db.db("loginsystem"); 
  dbo.collection("users").insertOne(user_info, function(err, res) {
                                                //  if (err) throw err;
                                                  db.close();
                                                });
                                          }); 
}

let users = []
dbConn.then(function(db) {
  var dbo = db.db("loginsystem"); 
  dbo.collection("users").find({}).toArray(function(err, result) {
   // if (err) throw err;
    console.log(result);
    users = result;
    db.close();
  });
});


// initilize of passport configiguration 
const initializePassport = require('./passport-config')

initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)


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
    //inserinto_dbb(user_data);
    alog(user_data);
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

app.listen(3000,
  () => { 
    console.log("server started")   
    })