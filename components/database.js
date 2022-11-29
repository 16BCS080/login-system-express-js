var MongoClient = require('mongodb').MongoClient;

//connection code
//        DB : loginsystem
//COLLECTION : Users
const uri = "mongodb+srv://js-mongo-db:9OiQI6hIF1Pgxn1N@cluster0.vivhzz6.mongodb.net/loginsystem?retryWrites=true&w=majority"; 
const mdb = MongoClient.connect(uri);

module.exports = mdb;

