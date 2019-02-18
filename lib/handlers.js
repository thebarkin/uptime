//THESE ARE THE REQUEST HANDLERS

//dependicies
const _data = require('./data');
const helpers = require('./helpers');

//define handlers
var handlers = {};

handlers.sample = (data, callback)=>{
  callback(406, {'name':'sample handler'});
};

handlers.ping = (data, callback)=>{
  callback(200);
};

//not found handler
handlers.notFound = (data, callback)=>{
  callback(404);
};

handlers.users = (data,callback)=>{
  const acceptableMethods = ['post','get','put','delete'];
  if (acceptableMethods.indexOf(data.method) > -1){
    handlers._users[data.method](data,callback);
  }else{
    callback(405);
  }
}

//container for the users submethods

handlers._users = {}

//post
//required data: firstName, lastName, phone, password, tosAgreement
//optional data: none
handlers._users.post = (data,callback)=>{
  //check that all required fields are filled out
  const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement === true ? true : false;

  if ( firstName && lastName && phone && password && tosAgreement ){
    //make sure that the user doesnt already exist
    _data.read('users',phone, (err,data)=>{
      if(err){
        //hash the password
        const hashedPassword = helpers.hash(password);

        if(hashedPassword){
          //create user object
          const userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'phone' : phone,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
          }

          _data.create('users',phone,userObject,(err)=>{
            if(!err){
              callback(200)
            }else{
              console.log(err);
              callback(500,{'Error': 'Could not create a new user.'})
            }
          });
        }else{
          console.log(err);
          callback(500,{'Error': 'Could not create a hashed password.'})
        }



      } else {
        //user already exists
        callback(400, {'Error': 'User with that phone number already exists.'})
      }
    });

  }else{
    callback(400, {'Error':'Missing required fields'});
  }

};

//get
//required data: phone
//optional data: none
//@todo only allow authenticated user access their object. dont let them access anyone elses.
handlers._users.get = (data,callback)=>{
  //check that the phone number provided is valid
  const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone){
    //look up user
    _data.read('users',phone, (err, data)=>{
      if (!err && data){
        //remove hashed password from the user object before returning it to the requester
        delete data.hashedPassword;
        callback(200, data);
      }else{
        callback(404)
      }
    })

  }else{
    callback(400,{'Error':'Missing phone number'})
  }
};

//put
//required data: phone
//optional data: firstName, lastName, password (at least one must be specified)
//@todo only let an authenticated user update their own object, dont let them update anyone elses
handlers._users.put = (data,callback)=>{
  //check for required field
  const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.length == 10 ? data.payload.phone.trim() : false;

  //check optional field
  const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  //error if the phone is invalid in all cases
  if(phone){
    //erorr if nothing is set to update

    if(firstName || lastName || password){

      //look up user
      _data.read('users',phone,(err, userData)=>{
        if(!err && userData){
          //update fields
          if (firstName){
            userData.firstName = firstName;
          }
          if (lastName){
            userData.lastName = lastName;
          }
          if (password){
            userData.hashedPassword = helpers.hash(password);
          }
          //store the new updates
          _data.update('users',phone,userData,(err)=>{
            if(!err){
              callback(200);
            }else{
              console.log(err);
              callback(500,{'Error':'Could not update the user.'})
            }

          })
        }else{
          callback(400,{'Error':'The specified user does not exists'})
        }
      })

    }else{
      callback(400,{'Error':'Missing fields to update.'})
    }


  }else{
    callback(400,{'Error':'Missing phone number.'})
  }


};

//delete
//required field: phone
//@todo only let authanticated user delete their object, dont let others delete their object
//@todo delete anmy other data files related to the user
handlers._users.delete = (data,callback)=>{
  const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone){
    //look up user
    _data.read('users',phone, (err, data)=>{
      if (!err && data){
        _data.delete('users',phone, (err)=>{
          if(!err){
            callback(200)
          }else{
            callback(500,{'Error':'Could not delete user.'})
          }
        })
      }else{
        callback(404)
      }
    })

  }else{
    callback(400,{'Error':'Missing phone number.'})
  }
};

//Export handlers
module.exports = handlers
