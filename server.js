var express = require('express'),
	fs = require('fs'),
    songs = require('./routes/songs');

var auth = express.basicAuth('1111', '1111');

var app = express();
app.use(express.bodyParser());
app.use("/static", express.static(__dirname + '/static'), {maxAge: 1});
app.post("/api/songs",auth,songs.uploadsong);
app.delete('/api/songs/:id',auth, songs.deletesong);
app.put('/api/songs/:id',auth,songs.modifysong);
app.get('/api/songs/:id/mp3',songs.mp3get);
app.get('/api/songs', songs.getsongs);
app.get('/api/auth/:password', songs.getauth);

app.listen(3000);
console.log('Listening on port 3000...');
