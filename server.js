var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// store current models' values
var models = {};


server.listen(8800);


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(__dirname + "/../app/"))

app.post("/:ns", function(req, res) {
	var ns = req.params.ns;
	console.log(req.body)
	//var schema = req.body;
	res.end(ns);
	if(typeof models[ns] !== "undefined") {
		return;
	}
	var connection = io.of("/" + ns).on('connection', function (socket) {
		connection.emit('update:' + ns, models[ns].value);

		socket.on('update:' + ns, function (data) {
			console.log(data)
			models[ns].value = data;
			socket.broadcast.emit('update:' + ns, data);
		})
	});

	models[ns] = {
		value : "",
		connection : connection
	}
});
