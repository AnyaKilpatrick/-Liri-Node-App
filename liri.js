// read and set any environment variables with the dotenv package
require("dotenv").config();
// import the keys.js file and store it in a variable.
var importKeys = require("keys.js");
// access my keys information
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);
