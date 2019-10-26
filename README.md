## Restaurant Reviews App


## To Run Locally: ##
Use the provided server.py that handles Access to Cross Origins requests,
by launching it from a terminal window and following the steps below:

* `cd <local path to the project folder>`
* `python server.py <portNumber>`

Alternatively, if you are using Chrome browser, you can install the
[Web Server extension](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en).
Remember: once you've configured the server to serve from your project directory,
expend the *Show Advanced Settings* section and check the *Set CORS headers* option.

After launching a server, if you want to run the application from a different device,
you could use [localtunnel](https://localtunnel.github.io/www/) (make sure to launch it
on the same port the server is running on).
In this case make sure to update the dbhelper.js DATABASE_URL() method to use the url provided by localtunnel.
