/**
 * @type {function}
 * @param {io} io
 */
exports.initGame = function(io)
{
	return function(socket)
	{
		var SocketHelper = require('./socketHelper').SocketHelper;
		var roomManager = require('./roomManager').roomManager;
		var clients = require('./clients').clients;
		var User = require('./user').User;

		var socketHelper = new SocketHelper(socket, io);
		var user = new User(socket.id);
		clients.addUser(user);
		var emitParams = {
			userId: user.id
		};

		socketHelper.emitToCurrentUser('handshake', emitParams);
		socketHelper.joinRoomCurrentUser('queue');

		socket.on('room.join', joinRoom);
		socket.on('game.start', startTheGame);
		socket.on('game.getUpdates', getUpdates);
		socket.on('game.playCard', playCard);
		socket.on('disconnect', disconnect);

		function joinRoom(params) {
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
		}

		function startTheGame(params)
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
		}

		function getUpdates(params)
		{
			var user = clients.getUser(params.userId);
			var room = roomManager.getRoom(user.room);
			var LoveLetter = room.getGame();
			var updateParams = LoveLetter.getGameUpdateMessage(user);
			socketHelper.emitToUser(user, 'game.update', updateParams);
		}

		function playCard(params)
		{
			var user = clients.getUser(params.userId);
			var room = roomManager.getRoom(user.room);
			var LoveLetter = room.getGame();
			var Game = LoveLetter.getGame();

			if (LoveLetter.getActivePlayer().id != user.id) {
				// TODO error handling
				console.error('Nem Te vagy az aktív játékos!');
				return;
			}

			var card = LoveLetter.getCards().getById(params.cardId);

			if (Game.isCardNeedPrompt(card) && !params.guess) {
				console.log('Card need prompt');
				socketHelper.emitToCurrentUser('card.prompt', params);

			} else if(Game.isCardNeedTarget(card, LoveLetter) && !params.target) {
				console.log('Card need target');
				socketHelper.emitToCurrentUser('card.target', params);

			} else {
				console.log('USER:', user.id);
				console.log('TARGET:', params.target||user);

				var player = LoveLetter.getPlayer(user);
				var targetPlayer = LoveLetter.getPlayer(params.target||user);
				var isPlayable = Game.isPlayableCard(card, player, targetPlayer, params.extraParams);

				console.log('is card playable?', isPlayable ? 'Y' : 'N');

				if (isPlayable) {
					try {
						if (card.id === 5) {
							params.deck = LoveLetter.getDeck();
						}
						var response = player.attack(Game, card, targetPlayer, params);
						eventHandler.emitToRoom(room, 'game.attack', response);
						console.log('Game.attack!');
					} catch(er) {
						console.log('Hiba történt a lap kijátszása közben:', er);
					}
				} else {
					// TODO nem lehet kijátszani, error handling
					console.log('Nem kijatszható a lap!');
				}
			}
		}

		function disconnect()
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
		}
	};
};
