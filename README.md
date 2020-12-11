# tiersforbeers
Turns gov.uk's coronavirus restrictions checker into an RSS feed.

![alt text][example]

Why? Because I got tired of having to check multiple friends and their locations tier status. What this app
does is take in a query string of locations/postal codes and generate an RSS feed once a day, noting any
changes in tier status. 

# Installation (Glitch)
1. Create a new account or sign into Glitch
2. Navigate to [tiersforbeers](https://glitch.com/edit/#!/tiersforbeers?path=README.md%3A1%3A0) code view
3. Click on the `tiersforbeers` dropdown in the top left and click the `Remix Project` button.
4. A new project should have been generated with the same code. 

# Usage
There's currently no UI to this so you have to construct the url yourself.

1. (Glitch) Click `Show` and choose `In a New Window`.
2. You should get a text representation of the documentation you're currently reading being served up at `/`
3. Append `rss.xml` and add locations as key/value pairs
   e.g. `/rss.xml?The Queen=SW1A 1AA`
4. You should get an RSS file back with all the locations you've specified in the query string.

# Feedback
Bugs? Feature Requests? File an issue on [GitHub](https://github.com/rjnienaber/tiersforbeers/issues).

[example]: https://github.com/rjnienaber/tiersforbeers/blob/master/example.png?raw=true "RSS Example text"