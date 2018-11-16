/*
 * Primary file for the API
 *
 *
 */

 //Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const _data = require('./lib/data');
const helpers = require('./lib/helpers');

// //TESTING
// _data.read('test','newFile', function(err,data){
//   console.log('this was the error', err, 'and this was the data:', data);
// });

//Instantiating the http server
const httpServer = http.createServer((req, res)=>{
  unifiedServer(req, res);
});

//start HTTP server
httpServer.listen(config.httpPort,()=>{
  console.log('The server is listening on port: '+config.httpPort);
});

//Instantiate https server
const httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions,(req, res)=>{
  unifiedServer(req, res);
});

//start HTTPS server
httpsServer.listen(config.httpsPort,()=>{
  console.log('The server is listening on port: '+config.httpsPort);
});

//all the server logic for both the http and https createServer
const unifiedServer = function(req,res){
  //get the url and parse it
  const parsedURL = url.parse(req.url,true);

  //get path from url
  const path = parsedURL.pathname;
  //removes extra slashes from the path
  const trimmedPath = path.replace(/^\/+|\/+$/g,'');

  //get the query string as an object
  var queryStringObject = parsedURL.query;

  //get the http method
  var method = req.method.toLowerCase();

  //get the headers as an object
  var headersObject = req.headers;

  //get the payload if there is any
  var decoder = new StringDecoder('utf-8');
  var streamBuffer = '';

  req.on('data',(data)=>{
    streamBuffer += decoder.write(data);
  });

  req.on('end',()=>{
    streamBuffer += decoder.end();

    //choose the handler this request should go to. if one is not found, use the not found handler
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    //construct the data object to send to the handler
    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headersObject,
      'payload' : helpers.parseJsonToObject(streamBuffer)
    };

    function chosenHandlerCallback(statusCode, payload){
      //use the status code calledback by the handler or default
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      //use the payload called back by the handler or default back to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      //convert the payload to a string
      var payloadString = JSON.stringify(payload);

      //send the response
      res.setHeader('Content-Type','application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log('Returning this response: ',statusCode,payloadString);
    }

    //route the request to the handler specified in the router
    chosenHandler(data, chosenHandlerCallback);
  });
}


//PATHS
//define request router OBJECT
var router = {
  'sample' : handlers.sample,
  'ping' : handlers.ping,
  'users' : handlers.users
};


