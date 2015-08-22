**Project prompt:**

We’re looking for a dashboard to help us understand our online community. Use the Twitter and StackOverflow APIs in combination with our services to give us a picture of how people are talking about AlchemyAPI. Build an intuitive, simple webpage that uses NLP to provide insights rather than simply aggregating data.

Feel free to use as many other APIs and libraries as you wish, but we are interested in content from StackOverflow and Twitter.

**Notes from Zhila:**
I chose not to use the Twitter API because it requires a backend for authorization and authentication. It requires the use of encoding credentials, OAuth, SSL, etc. For a simple project, this just wasn't feasible. Because I didn't create a backend, the only way I could use AlchemyAPI with a front-end project was to expose my API key.


**Time spent on this project: 8 hours total.** 
 - 	2 hours: coming up with an idea, familiarizing myself with the Alchemy and Stack Overflow APIs and scoping out the feasibility of using Twitter.
 - 	2 hours: Testing out different layouts and creating an HTML structure.
 - 	4 hours: Writing out JavaScript, making modifications, commenting and cleaning up code.

HOW THE APP WORKS:
------------------

This app allows users to search for sentiment and content analysis on topics of their choice from Stack Overflow and the Alchemy News API.

**A)** Users select either tech users or the media, a verb that describes the analysis they're looking for, and type in a subject. In this case, they can choose between 'feeling' (sentiment) or 'talking' (keywords). They then choose how many days ago they want to look back.

**B)** In the background, the app pulls data based on what the user has entered.

 - 	If the user selected 'feeling', a sentiment analysis is run. 
 - 	If the user selected 'talking', a content analysis is run.
 
If a media/blogger is selected, data is pulled from only one source, the News Api. 
If user is selected, questions on their subject of choice is pulled from Stack Overflow and then sent to the Language Api.

**C)** I ran out of time to finish multiple tables. Stack Overflow's keyword analysis is pulled into a table, and all other sources return pretty-printed JSON.

FINAL THOUGHTS:
I had a tough time with this assignment. Not from a technical standpoint, but because I used several data sources I wasn't familiar with and wasn't working within my normal development infrastructure. 

This really isn't reflective of my coding skill, so feel free to ask some questions. 
**Thanks for reviewing this project!**
