
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
	app.use(express.errorHandler());
}

var clients = {};
var server = http.createServer(app).listen(app.get('port'));
var io = require('socket.io').listen(server);
io.set('log level', 1);
require('./src/socketHandler').socketHandler(clients, io);

app.get('/', routes.index);
app.get('/room/:name', routes.gamePlay);
app.get('/api/:object/:method', routes.api);
