loadRequires();
loadKeys();
mainMenu();

function loadRequires() {
  fs = require("fs");
  twitter = require("twitter");
  spotify = require("node-spotify-api");
  request = require("request");
  inq = require("inquirer");
  dotenv = require("dotenv").config();
  keys = require("./key.js");
  moment = require('moment');
}

function loadKeys() {
  spoti = new spotify(keys.spotify);
  client = new twitter(keys.twitter);
}

function mainMenu() {
  inq
    .prompt([
      {
        type: "list",
        message: "Whaddya wanna do?",
        choices: [
          "my-tweets",
          "spotify-this-song",
          "movie-this",
          "do-what-it-says"
        ],
        name: "choice"
      }
    ])
    .then(function(inq) {
      switch (inq.choice) {
        case "my-tweets":
          tweetIt();
          break;
        case "spotify-this-song":
          spotIt();
          break;
        case "movie-this":
          movIt();
          break;
        case "do-what-it-says":
          fs.readFile("./random.txt", "utf8", function(error, data) {
            if (error) {
              console.log("fs error: " + error);
            }
            let parameters = data.split(",");
            let action = parameters[0];
            let params = parameters.slice(1);
            doIt(action, params);
          });
          break;
      }
    });
}

function tweetIt() {
  let tweetParam = {
    user_id: "jewis168",
    count: 20
  };
  client.get("statuses/user_timeline", tweetParam, tweetFollowUp);
  function tweetFollowUp(err, output, response) {
    if (err) {
      console.log("twitter error: " + err);
      return;
    }
    for (var i = 0; i < tweetParam.count; i++){
      let time = output[i]['created_at'].split(' ');
      time = time.slice(0,4);
      console.log("\nTweet Number : "+(i+1));
      console.log("Date: "+time);
      console.log("Content: "+output[i].text);
    }
  }
}

function spotIt(params) {
  if (!params) {
    inq
      .prompt([
        {
          type: "input",
          message: "Please enter a song: ",
          name: "songInput"
        }
      ])
      .then(function(data) {
        if (data.songInput) {
          spotSearch(data.songInput);
        } else {
          spotSearch("purple haze");
        }
      });
  } else {
    spotSearch(params);
  }
  function spotSearch(input) {
    params = input;
    spoti.search({ type: "track", query: params }, function(err, output) {
      if (err) {
        console.log("spotify error: " + err);
        return;
      }
      console.log("\nSong: "+output.tracks.items[0].name)
      console.log("Artist: "+output.tracks.items[0].artists[0].name);
      console.log("Album: "+output.tracks.items[0].album.name)
      console.log("Preview Link: "+output.tracks.items[0]['external_urls'].spotify);
    });
  }
}

function movIt(params) {
  if (!params) {
    inq
      .prompt([
        {
          type: "input",
          message: "Please enter a movie: ",
          name: "movieInput"
        }
      ])
      .then(function(data) {
        if (data.movieInput) {
          movSearch(data.movieInput);
        } else {
          movSearch("Mr.Nobody");
        }
      });
  } else {
    movSearch(params);
  }
  function movSearch(input) {
    let searchTerm = input.split(" ");
    searchTerm = searchTerm.join("+");
    var queryUrl =
      "http://www.omdbapi.com/?t=" +
      searchTerm +
      "&y=&plot=short&apikey=trilogy";
    request(queryUrl, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        let data = JSON.parse(body);
        if(!data.Title)
        {
          console.log("no search results");
          return;
        }
        console.log("Movie Name: "+data.Title);
        console.log("Release Year: "+data.Year)
        console.log("The movie's IMDB rating is: " + data.imdbRating);
        for (var i = 0; i < data.Ratings.length;i++)
        {
          if(data.Ratings[i].Source=="Rotten Tomatoes")
          {
            console.log("The movie's Rotten Tomatos rating is: " + data.Ratings[i].Value);
          }
        }
        console.log("Cast: "+data.Actors);
        console.log("Plot: "+data.Plot);
      }
    });
  }
}

function doIt(action, params) {
  switch (action) {
    case "my-tweets":
      tweetIt();
      break;
    case "spotify-this-song":
      spotIt(params);
      break;
    case "movie-this":
      movIt(params);
      break;
  }
}
