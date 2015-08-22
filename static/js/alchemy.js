// NOTES: 
// 1) I use pure JS for work, so I'm going to keep the jQuery minimal so you can see my regular coding style.  I have no problems with jQuery but the only reason why I'm using it is for Bootstrap. It isn't really needed for this level of complexity.

// 2) In production, I would never expose an API key publicly. If I had a backend, I'd keep the api key secret, along with other sensitive information.

// 3) I only had time to generate one table, so I created a StackOverflow keywords table. I wanted to generate one for StackOverflow sentiments and the media query, but ran out of time and kept hitting API limits. So for those, JSON prints to the template. I'd never do that for a production app, but had to so here in the interest of time.

$( document ).ready(function() {
	new AlchemyNewsNetwork();
});

// The AlchemyNewsNetwork object is the main class for this app.
var AlchemyNewsNetwork = function() {
	// See my note above about exposing API keys and other sensitive information.
	this.ALCHEMY_API_KEY = '8cff27cd2fc82e9840478030cae451ea59cf4816';
	this.BASE_MEDIA_QUERY_START = ['https://access.alchemyapi.com/calls/data/GetNews?apikey=', this.ALCHEMY_API_KEY, '&return=enriched.url.title,enriched.url.url,enriched.url.author,enriched.url.publicationDate,enriched.url.'];
	this.BASE_MEDIA_QUERY_END ='|&limit=10&outputMode=json';
	this.BASE_STACKOVERFLOW ='https://api.stackexchange.com/2.2/questions?order=desc&sort=activity&site=stackoverflow&';
	var isOpen = false;
	var panelAccordion = document.getElementById('panel-accordion');
	var originalAccordion = document.getElementById('accordion-reset').cloneNode(true);

	// Use one main event listener for the body. 
	document.body.addEventListener("click", function(e) {
		var target = e.target;
		if (target.classList.contains('submit')) {
			var form = document.getElementsByTagName('form')[0];
			if (form.checkValidity()) {
				panelAccordion.innerHTML = originalAccordion.innerHTML;

				this.initQueryProcess(
					document.getElementById('noun-select').value,
					document.getElementById('verb-select').value,
					document.getElementById('subject-input').value,
					document.getElementById('time-select').value
					);

				if (!isOpen) {
					panelAccordion.classList.remove('hidden');
					isOpen = true;
				}
			} else {
				form.classList.add('invalid');
			}
		}
	}.bind(this));	
};

// Start the process for running an API call.
AlchemyNewsNetwork.prototype.initQueryProcess = function (noun, verb, subject, time) {
	// First, get common components to all queries. 
	var times = this.buildCommonQueryComponents(time);
	var alchemyQueryString;
	// Then, build the custom query string. Selecting 'new users' and 'power users' first makes a call to StackExchange, then feeds that info into AlchemyAPI.
	if (noun == 'media') {
		this.generateMediaQueryString(subject, verb, times);
	} else {
		this.generateStackOverflowQueryString(subject, verb, times);
	}
};


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
AlchemyNewsNetwork.prototype.generateMediaQueryString = function(subject, verb, times) {
	var queryString;
	var searchType = (verb == 'keywords') ? 'concepts' : 'docSentiment';
	var middleOfQuery = [searchType, '&start=', times.start_time, '&end=',  times.end_time, '&q.enriched.url.entities.entity=|text=' + subject].join('');

	queryString = this.BASE_MEDIA_QUERY_START.join('') + middleOfQuery + this.BASE_MEDIA_QUERY_END;
	this.runQuery(queryString, function(data){this.prettyPrintJson(data)}.bind(this));
};


// Generates a query string for the query about users, which users StackOverflow.
// Returns values to be passed into Handlebars.js.
AlchemyNewsNetwork.prototype.generateStackOverflowQueryString = function(subject, verb, times) {
	var queryString = [this.BASE_STACKOVERFLOW, 'tagged=', subject, '&fromdate=', times.start_time, '&todate=', times.end_time].join('');
	return this.runQuery(
		queryString, function(data){this.stackOverflowToAlchemy(verb, data)}.bind(this));
};


// Converts StackOverflow data to a format that can be easily read by AlchemyAPI.
// If there's data from StackOverflow, it returns the results from sending the converted text to Alchemy's language API.
AlchemyNewsNetwork.prototype.stackOverflowToAlchemy = function(verb, data) {
	console.log('StackOverflow results to send to AlchemyApi:');
	console.log(data);
	if (data['items'].length > 0) {
		// prep data here
		var textData = [];
		var stackOverflowData = data;
		var searchType;
		var callback;

		if (verb == 'sentiment') {
			searchType = 'TextGetTextSentiment';
			callback = function(data){this.prettyPrintJson(data)}.bind(this);
		} else {
			searchType = 'TextGetRankedKeywords';
			callback = function(data){this.generateTable(data, stackOverflowData)}.bind(this);
		};

		data['items'].forEach(function(item) {
			textData.push(item['is_answered'] ? 'answered' : 'unanswered');
			textData.push(item['title']);
			textData.push.apply(textData, item['tags']);
		}.bind(this))
		var query = ['http://access.alchemyapi.com/calls/text/', searchType, '?apikey=', this.ALCHEMY_API_KEY, '&outputMode=json&text=', encodeURIComponent(textData.join(' '))];
		return this.runQuery(query.join(''), callback);
	} else {
		noResults();
	}
};

// Run the query and pass in a callback, to be used when data is returned.
// Returns JSON response text.
AlchemyNewsNetwork.prototype.runQuery = function(url, callback) {
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
	        console.log(xmlHttp.responseText);
	    }
	};
	xmlHttp.onerror = function (e) {
		return console.error(xmlHttp.statusText);
	};

	xmlHttp.send();
};


// Generates a bootstrap table in the template, after receiving data.
AlchemyNewsNetwork.prototype.generateTable = function(data, extraData) {
	// If I have time, build something cool with the extra data. Wordcloud?
	var tableContainer = document.getElementById('analysis-table');
	var tableBody = tableContainer.querySelector('tbody');
	if (data['keywords']) {
		data['keywords'].forEach(function(keyword){
			var row = ['<tr><td>', keyword['text'],'</td><td>', keyword['relevance'],'</td></tr>'].join('');
			tableBody.insertAdjacentHTML('beforeend', row);
		}.bind(this));
		tableContainer.classList.remove('hidden');
	} else {
		apiExceeded();
	}
};


// Pretty prints JSON to display in the template.
AlchemyNewsNetwork.prototype.prettyPrintJson = function(data) {
	var elementForJson = document.getElementById('show-json');
	elementForJson.innerHTML = JSON.stringify(data, null, 2); 
	elementForJson.classList.remove('hidden');
};


// If there are no results, show a 'no results' message in the template.
var noResults = function() {
	document.getElementById('no-results').classList.remove('hidden');
};


// If api query limits are exceeded, show a message.
var apiExceeded = function() {
	document.getElementById('api-limit').classList.remove('hidden');
};

// Generates an epoch time span from the user's selected time span to today.
// Returns a dict with start_date and end_date and epoch time as values.
var getEpochTimeIntervals = function(selection) {
	// Get epoch time, without milliseconds.
	var end = Math.floor((new Date).getTime()/1000);
	var start =  end - selection*24*3600;

	return {'start_time': start, 'end_time': end}
};