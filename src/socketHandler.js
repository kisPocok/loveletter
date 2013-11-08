var User = require('./user').user;

/**
 * @param {io} io
 * @param {express} app
 */
exports.socketHandler = function(io, app)
{
	var SocketHelper = app.get('socketHelper');
	var roomManager = app.get('roomManager');
	var clients = app.get('clients');

	io.sockets.on('connection', function(socket)
	{
		var user = new User(socket.id);
		clients.addUser(user);
		var socketHelper = new SocketHelper(socket, io);
		var emitParams = {
			userId: user.id
		};
		socketHelper.emitToCurrentUser('handshake', emitParams);
		socketHelper.joinRoomCurrentUser('queue');

		socket.on('room.join', function(params) {
			var room = roomManager.createRoom(params.room);
			room.addUser(params.user);
			var emitParams = {
				playerCount: room.getUserIdList().length
			};
			socketHelper.changeRoomCurrentUser('queue', params.room);
			socketHelper.emitToRoom(params.room, 'room.playerJoined', emitParams);
		});

		socket.on('game.start', function(params) {
			// TODO
		});
	});

	return this;
};
