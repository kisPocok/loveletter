var config = require('./config').appConfig;
var Player = require('./player').player;

/**
 * @param {object} clients
 * @param {io} io
 */
exports.socketHandler = function(clients, io)
{
	var srvHelper = require('./srvHelper').srvHelper(clients, io);
	var addUser = function(socketId)
	{
		clients[socketId] = new Player(socketId);
	};

	io.sockets.on('connection', function(socket)
	{
		addUser(socket.id);
		srvHelper.emitToSocket(socket.id, 'news', 5);
	});
};
