var MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    db;

var mongoClient = new MongoClient(new Server('localhost', 27017));
mongoClient.open(function(err, mongoClient) {
    db = mongoClient.db("songs");
});

var ObjectID = require("mongodb").ObjectID;
var fs = require('fs');
var adminKey = "abc";

exports.uploadsong = function(req,res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  var objid = ObjectID();
  var mp3 = fs.readFileSync(req.files.mp3.path,'base64');
  var songname = req.body.songname;
  db.collection('songs', function(err, collection) {
    collection.insert({id:objid,songname:songname},{safe:true}, function(err, result) {});
  });  
  db.collection('mp3', function(err, collection) {
    collection.insert({id:objid,mp3:mp3},{safe:true}, function(err, result) {});
  });  
  res.end();
};

exports.modifysong = function(req,res)
{
  console.log(req.body.score);
  var objid = ObjectID(req.params.id);
  db.collection('songs', function(err, collection) {

    collection.update({id:objid},{$set: {score:req.body.score}},{multi:false}, function(err, result) {
      console.log(err);
    });
  });  

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end();
};

 
exports.deletesong = function(req,res)
{
  var objid = ObjectID(req.params.id);
  db.collection('songs', function(err, collection) {
    collection.remove({id:objid},1, function(err, result) {});
  });          
  db.collection('mp3', function(err, collection) {
    collection.remove({id:objid},1, function(err, result) {});
  });          
  res.jsonp({success: true});
}
exports.mp3get = function (req,res)
{
  var objid = ObjectID(req.params.id);

      db.collection('mp3', function(err, collection) {
        collection.findOne({id:objid}, function(err, item) {
        var binAudio = new Buffer(item.mp3, 'base64');
        res.writeHead(200, {
          'Content-Type': 'audio/mp3',
          'Content-Length': binAudio.length
        });
        res.end(binAudio)
        });
    });
} 

exports.getsongs = function(req, res) {
    db.collection('songs', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.jsonp(items);
        });
    });
};
 
exports.getauth = function(req, res) {
    if (req.params.password=='1111') 
    {
      res.jsonp({success: true});

    } else
    {
      res.jsonp({success: false});      
    }
};


