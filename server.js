require('dotenv').config();
const express = require('express');
const server = express();
const database = require('./database');
const passport = require('passport');
const methodOverride = require('method-override');

server.use(express.json({ limit: '1mb' }));
server.use(express.urlencoded({ extended: false }));

const flash = require('express-flash');
const session = require('express-session');

const initializePassport = require('./passport-config');
const { transformAuthInfo } = require('passport');
initializePassport(passport);

server.use(express.json());
server.use(express.static('./public/home'));
server.use('/abus', express.static('./public/abus'));
server.use('/howto', express.static('./public/howto'));
server.use('/loc', express.static('./public/loc'));
server.use('/tes', express.static('./public/tes'));


server.use(flash());
server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
server.use(methodOverride('_method'));

server.use(passport.initialize());
server.use(passport.session());

server.get('/login', checkNotAuthenticated);
server
    .get('/user_login/:username/:password', (req, res) => {
        let sql = `SELECT * FROM usuarios where binary username='${req.params.username}' and binary password='${req.params.password}'`;
        let query = database.query(sql, (err, result) => {
            if (err) throw err;
            res.end(JSON.stringify(result));
        })
    })
    .post('/login', checkNotAuthenticated, passport.authenticate('local', {
        successRedirect: '/login',
        failureRedirect: '/login',
        failureFlash: true
    }));

server.get('/entidad', checkAuthenticatedEnt);
server.get('/veedor', checkAuthenticatedVeedor);
server.get('/entidad/data', checkAuthenticatedEnt, (req, res) => {
    let sql = 'select conjunto,idestado,ubicacion,d.idveedor,iddonaciones from veedores v, donaciones d where v.idveedor=d.idveedor';
    database.query(sql, (err, result) => {
        if (err) {
            res.end(JSON.stringify([]));
            return;
        }
        res.end(JSON.stringify(result));
    });
});
server.get('/loc/data', (req, res) => {
    let sql = 'select conjunto,idestado,ubicacion from veedores v, donaciones d where v.idveedor=d.idveedor';
    database.query(sql, (err, result) => {
        if (err) {
            res.end(JSON.stringify([]));
            return;
        }
        res.end(JSON.stringify(result));
    });
});

server.get('/entidad/updatestate/:id/:ns', checkAuthenticatedEnt, (req, res) => {
    let sql = `UPDATE donaciones SET idestado = ${req.params.ns} WHERE (iddonaciones = ${req.params.id})`;
    database.query(sql, (err, result) => {
        if (err) {
            res.end(JSON.stringify([]));
            return;
        }
    });
    res.end();
});
server.get('/veedor/data', checkAuthenticatedVeedor, (req, res) => {
    let sql = `select iddonaciones, idestado from donaciones where idveedor=${req.user.idusuario};`;
    database.query(sql, (err, result) => {
        if (err) {
            res.end(JSON.stringify([]));
            return;
        }
        res.end(JSON.stringify(result));
    });
});
server.get('/veedor/updatestate/:id/:ns', checkAuthenticatedVeedor, (req, res) => {
    let sql = `UPDATE donaciones SET idestado = ${req.params.ns} WHERE (iddonaciones = ${req.params.id})`;
    database.query(sql, (err, result) => {
        if (err) {
            res.end(JSON.stringify([]));
            return;
        }
        res.end(JSON.stringify(result));
    });
});
// Authentication Functions
function checkAuthenticatedEnt(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.rol == 0) {
            server.use("/entidad", express.static('./public/entidad'));
            return next();
        } else {
            req.logOut();
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
}

function checkAuthenticatedVeedor(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.rol == 1) {
            server.use("/veedor", express.static('./public/veedor'));
            return next();
        } else {
            req.logOut();
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }

}


function checkNotAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        server.use("/login", express.static('./public/login'));
        return next();
    } else {
        if (req.user.rol == 0) {
            res.redirect('/entidad');
        }
        if (req.user.rol == 1) {
            res.redirect('/veedor');
        }
    }

}

// Log Out Method
server.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

server.listen(80);