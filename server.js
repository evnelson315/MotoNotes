

// Dependencies:
var request = require('request'); // Snatches html from urls
var cheerio = require('cheerio'); // Scrapes our html
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
console.log("working");

// Make a request call to grab the html body from the site of your choice
// Notice: the page's html gets saved as the callback's third arg
request("https://austin.craigslist.org/search/mcy", function (error, response, html) {

	// Load the html into cheerio and save it to a var.
  // '$' becomes a shorthand for cheerio's selector commands, 
  //  much like jQuery's '$'.
  var $ = cheerio.load(html);

  // an empty array to save the data that we'll scrape
  var result = [];

  // Select each instance of the html body that you want to scrape.
  // NOTE: Cheerio selectors function similarly to jQuery's selectors, 
  $("div.rows").each(function(i, element){

  var bikeText = $(element).find('p').find('span.txt').find('span.pl').find('a').find('span').text();
    // Scrape information from the web page, put it in an object 
    // and add it to the result array. 
  result.push({"data scraped: ":bikeText});
    });
  console.log(result);
});
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

// make public a static dir
app.use(express.static('public'));


// Database configuration with mongoose
mongoose.connect('My database goes here');
var db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});


// Bring in our Models: Not and User
var Note = require('./models/Note.js');
var User = require('./models/User.js');



// We'll create a new user by using the User model as a class.
// The "unique" rule in the Library model's schema
// will prevent duplicate users from being added to the server.

// using the save method in mongoose, we create our example user in the db
exampleUser.save(function(err, doc) {
  // log any errors
  if (err) {
    console.log(err);
  } 
  // or log the doc
  else {
    console.log(doc);
  }
});

// Routes
// ======

// Simple index route
app.get('/', function(req, res) {
  res.send(index.html);
});


// Route to see notes we have added
app.get('/notes', function(req, res) {
  // find all notes in the note collection with our Note model
  Note.find({}, function(err, doc) {
    // send any errors to the browser
    if (err) {
      res.send(err);
    } 
    // or send the doc to the browser
    else {
      res.send(doc);
    }
  });
});


// Route to see what user looks like without populating
app.get('/user', function(req, res) {
  // find all users in the user collection with our User model
  User.find({}, function(err, doc) {
    // send any errors to the browser
    if (err) {
      res.send(err);
    } 
    // or send the doc to the browser
    else {
      res.send(doc);
    }
  });
});


// New note creation via POST route
app.post('/submit', function(req, res) {
  // use our Note model to make a new note from the req.body
  var newNote = new Note(req.body);
  // Save the new note to mongoose
  newNote.save(function(err, doc) {
    // send any errors to the browser
    if (err) {
      res.send(err);
    } 
    // Otherwise
    else {
      // Find our user and push the new note id into the User's notes array
      User.findOneAndUpdate({}, {$push: {'notes': doc._id}}, {new: true}, function(err, doc) {
        // send any errors to the browser
        if (err) {
          res.send(err);
        } 
        // or send the doc to the browser
        else {
          res.send(doc);
        }
      });
    }
  });
});

// Route to see what user looks like WITH populating
app.get('/populateduser', function(req, res) {
  // Prepare a query to find all users
  User.find({})
    // and on top of that, populate the notes.
    // (replace the objectIds in the notes array with bona-fide notes)
    .populate('notes')
    // now, execute the query
    .exec(function(err, doc) {
      // send any errors to the browser
      if (err) {
        res.send(err);
      } 
      // or send the doc to the browser
      else {
        res.send(doc);
      }
    });
});


// Listen on Port 3000
app.listen(3000, function() {
  console.log('App running on port 3000!');
});