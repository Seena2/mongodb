//Import mongo client from MongoDB driver package
//destructure and import out of "mongodb" pacakge
const { MongoClient } = require("mongodb");

let dbConnection;

//creating DB connection functions as object property and exporting
module.exports = {
  //property representing function  which initially connect to the DB
  //note it takes callback function and which runs after the collection is established or failed
  connectToDb: (cbf) => {
    //call connect method which takes the connections string(special URL) to our DB
    // this is async task that takes time, and retuns a promise to tack to "then" when the function complete
    //and return object which is used as arguement in then method, which represent client
    //we just created by connecting to the DB.
    //on that "client" object you can call db() method, which returns DB connection (or interface to interact with)
    MongoClient.connect("mongodb://localhost:27017/Bookstore")
      .then((client) => {
        dbConnection = client.db();
        return cbf();
      })
      .catch((err) => {
        console.log(err);
        return cbf(err);
      });
  },
  //property representing function that returns our DB connection after connection is established/created
  getDb: () => dbConnection,
};
