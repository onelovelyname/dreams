// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
// PULL from existing chess project! #1
app.use(express.json());

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);


// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE Dreams (dream TEXT, authorId INT)', [], function(result){
      console.log("result1: " + result);
    });
    db.run('CREATE TABLE Author (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)', [], function(result){
      console.log("result2: " + result);
    });
    console.log('New tables Dreams and Author created!');
    
    // insert default dreams
    db.serialize(function() {
      db.run('INSERT INTO Dreams (dream, authorId) VALUES ("Find and count some sheep", 1), ("Climb a really tall mountain", 2), ("Wash the plates", 3)');
      db.run('INSERT INTO Author (id, name) VALUES (1, "Salar"), (2, "Mahd"), (3, "Fawzi")');
    });
  }
  
  else {
    console.log('Database "Dreams" ready to go!');
    let query = "SELECT Dreams.*, Author.Name FROM Dreams LEFT OUTER JOIN Author ON Dreams.AuthorId = Author.id";

    db.each(query, function(err, row) {
      if ( row ) {
        console.log('record:', row);
      } else if (err) {
        console.log("error: " + err);
      }
    });
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// endpoint to get all the dreams in the database
// currently this is the only endpoint, ie. adding dreams won't update the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3
app.get('/getDreams', function(request, response) {
  let query = "SELECT Dreams.*, Author.Name FROM Dreams LEFT OUTER JOIN Author ON Dreams.AuthorId = Author.id";
  
  db.all(query, function(err, rows) {
    
    response.send(JSON.stringify(rows));
  });
});

app.post('/postDream', function(request, response) {
  const newAuthor = request.body.author;

  // check if Author name already exists in the database 
  let authorInsertQuery = `INSERT INTO Author (name)
    SELECT $name
    WHERE NOT EXISTS(
        SELECT 1
        FROM Author
        WHERE name = $name
        )
    LIMIT 1;`
  
  let authorIdQuery = `SELECT id from Author WHERE name = $name LIMIT 1`;
  
  db.run(authorInsertQuery, {$name: newAuthor}, function(){
    db.all(authorIdQuery, {$name: newAuthor}, function(err, rows){
      let id = rows[0].id;
        if (id) {
          let dreamQuery = `INSERT INTO Dreams (dream, authorId) VALUES ($dream, $id)`;
          const newDream = request.body.dream;
          db.run(dreamQuery, {$dream: newDream, $id: id});
          console.log("Heard posted dream!");
        }
    })
  })
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
