const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb://elenakedamail_db_user:<password>@ac-nbsuhc2-shard-00-00.ixpnbhi.mongodb.net:27017,ac-nbsuhc2-shard-00-01.ixpnbhi.mongodb.net:27017,ac-nbsuhc2-shard-00-02.ixpnbhi.mongodb.net:27017/?ssl=true&replicaSet=atlas-tdt8x2-shard-0&authSource=admin&appName=Cluster0",
  )
    .then((client) => {
      console.log("Connected!");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log({ mondoDbConnectionErr: err });
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
