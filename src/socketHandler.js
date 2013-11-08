/**
 * @type {function}
 * @param {io} io
 * @param {express} app
 */
exports.socketHandler = function(io, app)
{
	var SocketHelper = app.get('socketHelper');
	var roomManager = app.get('roomManager');
	var clients = app.get('clients');
	var User = app.get('user');

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
			var user = clients.getUser(params.user.id);
			var room = roomManager.createRoom(params.room);
			room.addUser(user);
			user.updateWithRoom(room);
			var emitParams = {
				playerCount: room.getUserIdList().length
			};
			socketHelper.changeRoomCurrentUser('queue', params.room);
			socketHelper.emitToRoom(params.room, 'room.playerJoined', emitParams);
		});

		socket.on('game.start', function(params)
		{
			//socketHelper.emitToRoom()
		});
	});

	return this;
};
