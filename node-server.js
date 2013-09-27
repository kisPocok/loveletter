'use strict';

var express = require('express'),
	app     = express(),
	server  = require('http').createServer(app),
	io      = require('socket.io').listen(server);

// Game requirements
var utils  = require('./src/utils').utils,
	Cards  = require('./src/cards').cards,
	Game   = require('./src/game').game,
	Events = require('./src/events').events,
	Player = require('./src/player').player,
	MySrv = require('./src/server').server,
	LoveLetter = require('./src/app').app;

// Config
app.use(express.bodyParser());
app.use(express.cookieParser('shhhh, very secret'));
app.use(express.session());

// Routing
app.configure(function() {
	//app.use(express.static( __dirname + '\\src'));
	//app.use("/static", express.static(__dirname + '/src/'));
});

var clients = {};
var srv = require('./src/srvHelper').srvHelper(clients, io);

app.get('/', MySrv.router.home);

server.listen(3001);

Events.setSocketIO(io);
io.set('log level', 1);
io.sockets.on('connection', function (socket) {


});
