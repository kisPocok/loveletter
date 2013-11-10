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
		var socketHelper = new SocketHelper(socket, io);
		var user = new User(socket.id);
		clients.addUser(user);
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
			if (!user.room) {
				return;
			}
			var room = roomManager.getRoom(user.room);
			var userList = room.getUserIdList();

			var LoveLetterApp = require('./loveletter/app').App;
			var LoveLetter = new LoveLetterApp(socketHelper, room);
			if (LoveLetter.isGameAlreadyStarted()) {
				socketHelper.emitToCurrentUser('game.alreadyStarted');
				return;
			}
			LoveLetter.createGame(userList);
			LoveLetter.startGame();
			room.setGame(LoveLetter);
		});

		socket.on('game.getUpdates', function(params)
		{
			var user = clients.getUser(params.userId);
			var room = roomManager.getRoom(user.room);
			var LoveLetter = room.getGame();
			var updateParams = LoveLetter.getGameUpdateMessage(user);
			socketHelper.emitToUser(user, 'game.update', updateParams);
		});

		socket.on('disconnect', function()
		{
			var user = clients.getUser(socket.id);
			if (user.room) {
				var room = roomManager.getRoom(user.room);
				room.removeUser(user);
				var emitParams = {
					playerCount: room.getUserIdList().length
				};
				socketHelper.emitToRoom(room, 'room.playerLeft', emitParams);
				var LoveLetter = room.getGame();
				if (LoveLetter && LoveLetter.isGameAlreadyStarted()) {
					LoveLetter.reset();
				}
			}
		});
	});

	return this;
};
