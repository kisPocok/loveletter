
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
app.use(express.cookieParser());
app.use(express.cookieSession({secret:'almafa'}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.set('clients', require('./src/clients').clients);
app.set('roomManager', require('./src/roomManager').roomManager);
app.set('socketHelper', require('./src/socketHelper').SocketHelper);
app.set('user', require('./src/user').User);

// development only
if ('development' === app.get('env')) {
	app.use(express.errorHandler());
}

var server = http.createServer(app).listen(app.get('port'));
var io = require('socket.io').listen(server);
io.set('log level', 1);
GLOBAL.socketHandler = require('./src/game').game(io, app);

app.get('/', routes.index);
