/*
 * Library for storing and editing data
 *
 */

 //Dependencies
let fs = require('fs');
let path = require('path');
let helpers = require('./helpers');


//Object for module
var lib = {};

//Base directory of the data folder
lib.baseDir = path.join(__dirname,'/../.data/');

//write data to a file
lib.create = (dir, file, data, callback) => {
    //open the file for writing the file itself
    //fileDescriptor uniquely identifies a file
  fs.open(lib.baseDir + dir + '/' + file + '.json','wx',(err,fileDescriptor) => {
    if (!err && fileDescriptor){

        //convert data to string
        let stringData = JSON.stringify(data);

        //write to file and close it
        fs.writeFile(fileDescriptor, stringData, (err)=>{
            if(!err){
                //close the file
                fs.close(fileDescriptor, (err)=>{
                    if(!err){
                        callback(false);
                    }else{
                        callback('Error closing the file.');
                    }
                })
            }else{
                callback('Error writing to new file');
            }
        })

    }else{
        callback('Could not create a new file, it may already exist');
    }
  });

};

//read data from a file
lib.read = (dir, file, callback)=>{
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data)=>{
      if ( !err && data ){
        callback(false, helpers.parseJsonToObject(data));
      }else{
        callback(err,data);
      }
    });
}

//update existing file with new data
lib.update = (dir, file, data, callback)=>{
    //open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',(err, fileDescriptor)=>{
        if(!err && fileDescriptor){
            //convert data to string
            let stringData = JSON.stringify(data);

            //truncate the contents of the file
            fs.truncate(fileDescriptor, (err)=>{
                if(!err){
                    //write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (err)=>{
                        if (!err){
                            fs.close(fileDescriptor,(err)=>{
                                if (!err){
                                    callback(false);
                                }else{
                                    callback('There was an error closing the file.');
                                }
                            })
                        }else{
                            callback('Error writing to existing file.');
                        }
                    });
                }else{
                    callback('Eror truncating file.');
                }
            })
        }else{
            callback('could not open file for updating, it may not exist yet.');
        }
    });
}

//delete file
lib.delete = (dir, file, callback)=>{
  //unlink file from filesystem
  fs.unlink(lib.baseDir+dir+'/'+file+'.json', (err)=>{
      if (!err){
          callback(false);
      }else{
          callback('Could not delete file.');
      }
  })
};

module.exports = lib;
