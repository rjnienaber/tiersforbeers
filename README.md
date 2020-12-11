# tiersforbeers 🍻
Turns the [gov.uk](https://www.gov.uk/find-coronavirus-local-restrictions) coronavirus restrictions checker into an RSS feed.

![alt text][example]

Why? Because I got tired of checking the location tier status of my friends. This app takes in a query string 
of locations/postal codes and generates an RSS feed once a day, showing any changes in tier status.
 
# Installation (Glitch) <img src="https://cdn.glitch.com/2bdfb3f8-05ef-4035-a06e-2043962a3a13%2Flogo-day.svg" width="35" alt="glitch logo">
1. Create a new account or sign into [Glitch](https://glitch.com/)
2. Click `New Project` and in the popup click the `Import from GitHub` button.
3. Paste in the GitHub repo for the tiersforbeers project: https://github.com/rjnienaber/tiersforbeers
4. A new project should be generated in about a minute. 

# Usage
There's currently no UI to this so you have to construct the RSS feed url yourself.

**N.B.** Like the gov.uk site, this only supports England at the moment. There are different restrictions in Scotland, Wales and Northern Ireland.

1. (Glitch) Click `Show` and choose `In a New Window`.
2. You should get a text representation of the documentation you're currently reading being served up at `/`
3. Append `rss.xml` and add locations as key/value pairs
   e.g. `/rss.xml?The Queen=SW1A 1AA&Sherlock Holmes=NW1 6XE`
4. You should get an RSS file back with all the locations you've specified in the query string.

# Feedback
Bugs? Feature Requests? File an issue on [GitHub](https://github.com/rjnienaber/tiersforbeers/issues).

[example]: example.png "RSS Example text"
