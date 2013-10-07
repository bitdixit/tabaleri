var express = require('express'),
	fs = require('fs'),
    songs = require('./routes/songs');

var app = express();
app.use(express.bodyParser());
app.use("/static", express.static(__dirname + '/static'), {maxAge: 1});
app.post("/api/songs",songs.uploadsong);
app.delete('/api/songs/:id', songs.deletesong);
app.put('/api/songs/:id',songs.modifysong);
app.get('/api/songs/:id/mp3',songs.mp3get);
app.get('/api/songs', songs.getsongs);

app.listen(3000);
console.log('Listening on port 3000...');
