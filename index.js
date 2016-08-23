#!/usr/bin/env node

/** Get environment variables */
try{
  require('./env')();
}catch(err){
  console.log('I recommend you try making an env file');
}

/** module dependencies */
var HttpMaster = require('http-master');

var httpmaster = new HttpMaster();

/* Get domain name and port from environment and store in express */
var DOMAIN_NAME = process.env.DOMAIN_NAME || 'localhost';
var PORT = (process.env.PROXY_PORT || 3000).toString();

/* Config for reverse proxy - some settings must be applied manually */
var config = {
  "watchConfig": false, // Reload on config change - note: only works with command line
  "workers": 2, // Number of workers - set higher if more requests
  "ports": { // Need to set this manually
  }
};

/* Create port object because keys need to be set manually */
config.ports[PORT] = {
  "router": {}
};

// API port and url
config.ports[PORT].router['api.' + DOMAIN_NAME] = process.env.API_URL || 3002;
// Website port and url
config.ports[PORT].router['*?.' + DOMAIN_NAME] = process.env.WEBSITE_URL || 3001;
// Catch rest for apache
config.ports[PORT].router['*'] = 8080;

var log = function(msg) { console.log(msg); };

/* Called on server initialization */
httpmaster.on('allWorkersStarted', function() { console.log('Workers activated'); });

/* Called on server reload of config - why is it called twice? */
httpmaster.on('allWorkersReloaded', function() { console.log('Workers reloaded'); });

httpmaster.on('logNotice', log); // Main logger
httpmaster.on('logError', log); // Serverside error
httpmaster.on('error', log); // Something weird is happening

/* Initializes reverse proxy */
httpmaster.init(
  config, // Configuration file. Settings explained there.
  function(err) {
    // Listening...
  }
);
