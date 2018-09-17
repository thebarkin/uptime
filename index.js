/*
 * Primary file for the API
 *
 *
 */

 //Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

//The server should respoind to all requests with a string
const server = http.createServer((req, res)=>{
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
  var buffer = '';

  req.on('data',(data)=>{
    buffer += decoder.write(data);
  });

  req.on('end',()=>{
    buffer += decoder.end();

    //choose the handler this request should go to. if one is not found, use the not found handler
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    //construct the data object to send to the handler
    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headersObject,
      'payload' : buffer
    };

    //route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload)=>{
      //use the status code calledback by the handler or default
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      //use the payload called back by the handler or default back to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      //convert the payload to a string
      var payloadString = JSON.stringify(payload);
      var queryString = JSON.stringify(queryStringObject);

      var totalItems = payloadString += queryString

      //send the response
      res.writeHead(statusCode);
      res.end(totalItems);

      console.log('Returning this response: ',statusCode,payloadString);

    });




  });

});

//start the erver, and have it listen on port 4000
server.listen(4000,()=>{
  console.log('The server is listening on port 4000');
});

//define handlers
var handlers = {};

handlers.sample = function(data, callback){
  //callback http status code, and a payload (object)
  callback(406, {'name':'sample handler'});
};

//not found handler

handlers.notFound = function(data, callback){
  callback(404);
};

//define request router
var router = {
  'sample' : handlers.sample
};
