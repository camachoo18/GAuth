const dotenv = require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const port = 3000;

const CLIENT_ID_GITHUB = process.env.CLIENT_ID_GITHUB;
const CLIENT_SECRET_GITHUB = process.env.CLIENT_SECRET_GITHUB;
const CLIENT_ID_GOOGLE = process.env.CLIENT_ID_GOOGLE;
const CLIENT_SECRET_GOOGLE = process.env.CLIENT_SECRET_GOOGLE;


passport.use(new GitHubStrategy({
  clientID: CLIENT_ID_GITHUB,
  clientSecret: CLIENT_SECRET_GITHUB,
  callbackURL: 'http://localhost:3000/auth/github/callback'
},
function(accessToken, refreshToken, profile, done) {
  return done(null, profile);
}
));

passport.use(new GoogleStrategy({
    clientID: CLIENT_ID_GOOGLE,
    clientSecret: CLIENT_SECRET_GOOGLE,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
  ));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.use(session({ 
    secret: "secret",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Middleware para verificar la autenticación
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

app.get("/", (req, res) => {
    const html = `
      <a href='/auth/github'>Autenticar con GitHub</a><br>
      <a href='/auth/google'>Autenticar con Google</a>
    `;
    res.send(html);
  });


app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }),
  
);

// Ruta para iniciar la autenticación con Google
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res, next) => {
        res.send('/profile');
    }
);
// Ruta de callback después de la autenticación con Google
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/profile');
    }
  );

app.get('/profile', ensureAuthenticated, (req, res) => {
    res.send(`Hola ${req.user.username || req.user.displayName}`);
});

app.get('/logout', (req, res) => {
    req.logout(done => {
        console.log('Usuario deslogueado');
    });
    res.redirect('/');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});