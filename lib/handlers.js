//THESE ARE THE REQUEST HANDLERS


//Dependencies




//define handlers
var handlers = {};

handlers.sample = function(data, callback){
    callback(406, {'name':'sample handler'});
};

handlers.ping = function(data, callback){
    callback(200);
};

//not found handler
handlers.notFound = function(data, callback){
    callback(404);
};

//Export handlers
module.exports = handlers