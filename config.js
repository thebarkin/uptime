/*
* Creatre and export configuration variables
*/

//Container for all environments
var environments = {}

//staging object, default
environments.staging = {
  'httpPort':4000,
  'httpsPort':4001,
  'envName' : 'staging'
};

//production object
environments.production = {
  'httpPort':5000,
  'httpsPort':5001,
  'envName' : 'production'
};

//Determine which environment should be exported out
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//check that the current evironment is one of the envrionments we have set
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//export the module

module.exports = environmentToExport;
