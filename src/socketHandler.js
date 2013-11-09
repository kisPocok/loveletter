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
			var user = clients.getUser(params.user.id); // TODO kipróbálni, ha kiveszem ugyanígy megy-e
			var room = roomManager.createRoom(params.room);
			var isEntered = room.addUser(user);
			if (!isEntered) {
				return;
			}
			user.updateWithRoom(room);
			var emitParams = {
				playerCount: room.getUserIdList().length
			};
			socketHelper.changeRoomCurrentUser('queue', params.room);
			socketHelper.emitToRoom(params.room, 'room.playerJoined', emitParams);
		});

		socket.on('game.start', function(params)
		{
			var room = roomManager.getRoom(user.room);
			var userList = room.getUserIdList();
			var LoveLetter = require('./loveletter/app').app;
			if (!user.room) {
				return;
			}
			if (LoveLetter.isGameAlreadyStarted()) {
				socketHelper.emitToCurrentUser('game.alreadyStarted');
				return;
			}
			LoveLetter.createGame(userList);
			LoveLetter.startGame();
		});
	});

	return this;
};
