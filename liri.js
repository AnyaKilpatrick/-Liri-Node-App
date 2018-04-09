// read and set any environment variables with the dotenv package
require("dotenv").config();
// import the keys.js file and store it in a variable.
var importKeys = require("./keys.js");

var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var request = require("request");
var fs = require("fs");

// access my keys information
var spotify = new Spotify(importKeys.spotify);
var client = new Twitter(importKeys.twitter);

//grabbing user's request
var userRequest = process.argv[2];

//OBJECT
var api={
    welcome: function(){
        if (process.argv.length === 2){
            console.log(`
            Hello there! My name is Liri!
            I am a command line node app. If you give me parameters, I will give you back some necessary data.
            Your options:
                my-tweets
                spotify-this-song
                movie-this
                do-what-it-says
            `)
        }
    },
    spotifyAPI: function(){
        var spotifyParams = { //setting parameters, to specify what we are searching for
            type: "track",
            query: name, //var name will have a value of user's input
            limit: 1
        }
    
        spotify.search(spotifyParams, function(err, data) {
            if (err) {
              return console.log('Error occurred: ' + err);
            }
            // console.log(data.tracks.items[0]);
            var grab = data.tracks.items[0];//path to main object where we grab all data
            var artist = grab.artists[0].name;
            if (grab.artists.length > 0){ //in cases when there is more then one artist
                for (var i=1; i<grab.artists.length; i++){
                    artist += " & "+grab.artists[i].name;
                }
            }
            console.log("Artist(s): "+ artist);
            console.log("Song: "+grab.name);
            console.log("Album: "+ grab.album.name);
            console.log("Preview link from Spotify: "+ grab.external_urls.spotify);
        })
    },
    twitterAPI: function(){
        var twitterParams = { //setting parameters, to specify what we are searching for
            q: "AnyaKilpatrick since:2018-01-01", //picking twitter user
            count: 20   //limiting number of tweets for pulling
        }
    
        client.get('statuses/user_timeline', twitterParams, function(error, tweets, response) {
            if (error) {
            console.log(error);
            }
            for (var t=0; t<tweets.length; t++){
                console.log(tweets[t].created_at + " " + tweets[t].text);
            }
        });
    },
    omdbAPI: function(){
        var myURL = "https://www.omdbapi.com/?t="+ name + "&apikey=58d589c6";

        request(myURL, function(error, response, body) {
            if(error){
                console.log(error);
            }
            var object = JSON.parse(body);
            if (object.Ratings[1].Value >= "90"){ //if high rated on Rotten Tomatoes
                console.log("Great choice! It's a high rated movie! You should watch it if you haven't done it yet!:)")
            }
            console.log("Title of the movie: "+object.Title);
            console.log("Year the movie came out: "+object.Year);
            console.log("IMDB Rating of the movie: "+object.imdbRating);
            console.log("Rotten Tomatoes Rating of the movie: "+object.Ratings[1].Value);
            console.log("Country where the movie was produced: "+object.Country);
            console.log("Language of the movie: "+object.Language);
            console.log("Plot of the movie: "+object.Plot);
            console.log("Actors in the movie: "+object.Actors);
        });
    },
    logCommand: function(){
        // var text = process.argv.slice(2).toString()+"\n";
        //decided not to use toString method as it separates each word of long song/movie names by commas too,and I wanted text to be displayed more organized
        var text = process.argv.slice(2)+"\n";// \n is a newline character in string literals
        if (process.argv.length > 3){
            var name = process.argv.slice(3).join(" ");
            text = process.argv[2]+', "'+name+'"\n';
        }
        fs.appendFile("log.txt", text, function(err){ //output the data to a .txt file called log.txt
            if (err) {
                return console.log(err);
              }          
        })
    }
}

api.welcome();
// ------------SPOTIFY-----------------//
if (userRequest === "spotify-this-song"){
    var name;//song name
    if (process.argv.length === 3){ // if user didn't specify a song name
    name = "Wanted Dead Or Alive";
    console.log("You didn't pick a song, but I can offer you this one.");
    }else{
        name = process.argv.slice(3).join(" "); //will grab user's input/ song's name
        api.logCommand(); //log text only if search was successful
    }
    api.spotifyAPI();
}   
//--------------TWITTER-----------------//
else if (userRequest === "my-tweets"){
    api.twitterAPI();
    api.logCommand();
}
//--------------- OMDb ---------------//
else if (userRequest === "movie-this"){
    var name;//movie name
    if (process.argv.length === 3){ // if user didn't specify a movie name
        name = "Mr+Nobody";
        console.log("You didn't pick a movie, but I can offer you something really good.");
    }else{
        name = process.argv.slice(3).join("+");
        api.logCommand(); //log text only if search was successful
    }
    api.omdbAPI();
}
//-----------Do What It Says--------------//
else if (userRequest === "do-what-it-says"){
    var dataArray;
    var command;
    var name;//name of song or movie
    fs.readFile("random.txt", "utf8", function(error, data){
        if (error){
            return console.log(error);
        }else{
            api.logCommand();//log command only when there are no errors
            dataArray = data.split(",");
            command = dataArray[0];
            if(dataArray.length>1){//if array's length is more than 1, there is a specified name of movie/song we need to grab
                name=dataArray[1].replace(/"/g, "");//getting rid of quotation marks around the string
                console.log(name);
            }
            //calling for different APIs
            if (command==="my-tweets"){
                api.twitterAPI();
            }
            else if(command==="spotify-this-song"){
                api.spotifyAPI();
            }
            else if(command==="movie-this"){
                api.omdbAPI();
            }
        }
    });
}