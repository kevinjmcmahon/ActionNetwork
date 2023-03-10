const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');

// Database configuration
const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  };

const db = pgp(dbConfig);

db.connect()
.then(obj => {
  console.log('Database connection successful'); // you can view this message in the docker compose logs
  obj.done(); // success, release the connection;
})
.catch(error => {
  console.log('ERROR:', error.message || error);
});

app.set('view engine', 'ejs');

app.use(bodyParser.json());

app.use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
    })
  );
  
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );


app.get('/', (req, res) => {
    res.render('pages/home');
})
  
  
  app.get('/search', (req, res) => {
    
    const search = req.query.searchInput;
    console.log(search);

    axios({
        url: `http://api.tvmaze.com/search/shows?q=${search}`,
        method: "GET",
    })
    .then(results => {
        // console.log(results.data);
        console.log(results.data);
        if(results.data.length != 0){
          res.render('pages/main',{shows: results.data});
        }else{
          throw new Error();
        }
    })
    .catch(err => {
        res.render('pages/home', {message: "Error: Show does not exist", err: true});
        return console.log(err);
    })
    
});  

app.listen(3000);
