// NOTES: 
// 1) I'm not used to using jQuery-- I use pure JS for work, so I'm going to keep the jQuery minimal so you can see my regular coding style.  I have no problems with jQuery but the only reason why I'm using it is for Bootstrap. It isn't really needed for this level of complexity.

// 2) In production, I would never expose an API key publicly. If I had a backend, I'd keep the api key secret, along with other sensitive information.

$( document ).ready(function() {
	new AlchemyNewsNetwork();
});

// The AlchemyNewsNetwork object is the main class for this app.
var AlchemyNewsNetwork = function() {
	// See my note above about exposing API keys and other sensitive information.
	this.ALCHEMY_API_KEY = '8cff27cd2fc82e9840478030cae451ea59cf4816';
	this.BASE_MEDIA_QUERY_START = ['https://access.alchemyapi.com/calls/data/GetNews?apikey=', this.ALCHEMY_API_KEY, '&return=enriched.url.title,enriched.url.url,enriched.url.author,enriched.url.publicationDate,enriched.url.'];
	this.BASE_MEDIA_QUERY_END ='&q.enriched.url.entities.entity=|text=AlchemyApi,type=company|&count=20&outputMode=json';
	this.BASE_STACKOVERFLOW ='https://api.stackexchange.com/2.2/questions?order=desc&sort=activity&site=stackoverflow&tagged=alchemyapi&';
	// Use one main event listener for the body. 
	document.body.addEventListener("click", function(e) {
		var target = e.target;
		if (target.classList.contains('submit') && !target.hasAttribute('aria-expanded')) {
			this.initQueryProcess(
				document.getElementById('noun-select').value,
				document.getElementById('verb-select').value,
				document.getElementById('time-select').value
			);
		}
	}.bind(this));	
};

// Starts the process for running an API call.
AlchemyNewsNetwork.prototype.initQueryProcess = function (noun, verb, time) {
	// First, get common components to all queries. 
	var times = this.buildCommonQueryComponents(time);
	var alchemyQueryString;
	// Then, build the custom query string. Selecting 'new users' and 'power users' first makes a call to StackExchange, then feeds that info into AlchemyAPI.
	if (noun == 'media') {
		alchemyQueryString = this.generateMediaQueryString(verb, times);
	} else {
		alchemyQueryString = this.generateStackOverflowQueryString(times);
	}
	this.runQuery(
		alchemyQueryString, function(data){this.generateTables(data)}.bind(this));
}

// Build common components used by all query strings.
// Returns a dict with start and end times, in epoch time.
AlchemyNewsNetwork.prototype.buildCommonQueryComponents = function(time) {
	// Calculate the time used in the query, based on the current date and user input.
	var days_int = parseInt(time, 10);
	var end = Math.floor((new Date).getTime()/1000);
	var start =  end - days_int*24*3600;

	return {'start_time': start.toString(), 'end_time': end.toString()}
};

// Generates a query string for the query about the media/bloggers, which uses the Alchemy News Api.
// Returns values to be passed into Handlebars.js.
AlchemyNewsNetwork.prototype.generateMediaQueryString = function(verb, times) {
	var searchType = (verb == 'keywords') ? 'concepts' : 'docSentiment';
	var middleOfQuery = [searchType, '&start=', times.start_time, '&end=',  times.end_time].join('');

	return this.BASE_MEDIA_QUERY_START.join('') + middleOfQuery + this.BASE_MEDIA_QUERY_END;
};

// Generates a query string for the query about users, which users StackOverflow.
// Returns values to be passed into Handlebars.js.
AlchemyNewsNetwork.prototype.generateStackOverflowQueryString = function(times) {
	var queryString = [this.BASE_STACKOVERFLOW, 'fromdate=', times.start_time, '&todate=', times.end_time].join('');
	console.log(queryString);
	this.runQuery(
		queryString, function(data){this.stackOverflowToAlchemy(data)}.bind(this));
};

// Converts StackOverflow data to a format that can be easily read by AlchemyAPI.
AlchemyNewsNetwork.prototype.stackOverflowToAlchemy = function(data) {
	var data = console.log(data);
	//return queryString;
};

// Run the query and pass in a callback, to be used when data is returned.
AlchemyNewsNetwork.prototype.runQuery = function(url, callback) {
	console.log(url);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, true);

    xmlHttp.onload = function (e) {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) {
            // If there's a callback, call it and pass in the response. If not, return the response.
            return callback(JSON.parse(xmlHttp.responseText));
        } else {
          return console.error(xmlHttp.statusText);
        }
      }
    };
    xmlHttp.onerror = function (e) {
      return console.error(xmlHttp.statusText);
    };

    xmlHttp.send();
};

// Generates an epoch time span from the user's selected time span to today.
// Returns a dict with start_date and end_date and epoch time as values.
var getEpochTimeIntervals = function(selection) {
	// Get epoch time, without milliseconds.
	var end = Math.floor((new Date).getTime()/1000);
	var start =  end - selection*24*3600;

	return {'start_time': start, 'end_time': end}
};


// TODO: Build results table using Handlebars?
// Run the query and pass in a callback, to be used when data is returned.
AlchemyNewsNetwork.prototype.generateTables = function(data) {
	console.log(data);
};

