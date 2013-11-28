var SocketHelper = require('./socketHelper').SocketHelper;
var RoomManager = require('./roomManager').RoomManager();
var UserManager = require('./UserManager').UserManager();
var User = require('./user').User;
var jade = require('jade');

var socketHelper, user, devMode = (process.env.DEV == 1);

/**
 * @type {function}
 * @param {socket} socket
 */
exports.initApplication = function(socket)
{
	socketHelper = new SocketHelper(socket);
	user = new User(socket.id);
	UserManager.addUser(user);

	var emitParams = {
		userId: user.id
	};
	socketHelper.emitToCurrentUser('handshake', emitParams);
	socketHelper.joinRoomCurrentUser('queue');

	socket.on('room.join', joinRoom);
	socket.on('game.start', startTheGame);
	socket.on('game.getUpdates', getUpdates);
	socket.on('game.playCard', playCard);
	socket.on('disconnect', disconnect(socket));
};

function joinRoom(params) {
	var user = UserManager.getUser(params.user.id); // TODO kipróbálni, ha kiveszem ugyanígy megy-e
	var room = RoomManager.createRoom(params.room);
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
	var room = RoomManager.getRoom(user.room);
	var userList = room.getUserIdList();

	var LoveLetterApp = require('./loveletter/app').App;
	var LoveLetter = new LoveLetterApp(socketHelper, room);
	if (LoveLetter.isGameAlreadyStarted()) {
		socketHelper.emitToCurrentUser('game.alreadyStarted');
		return;
	}
	LoveLetter.createGame(userList);
	if (devMode) {
		// For science!
		var cards = LoveLetter.getCards().list;
		LoveLetter.startDevGame(
			cards.guard,
			cards.baron,
			cards.handmaid
		);
	} else {
		// Normal start
		LoveLetter.startGame();
	}
	room.setGame(LoveLetter);
}

function getUpdates(params)
{
	var user = UserManager.getUser(params.userId);
	var room = RoomManager.getRoom(user.room);
	var LoveLetter = room.getGame();
	var updateParams = LoveLetter.getGameUpdateMessage(user);
	socketHelper.emitToUser(user, 'game.update', updateParams);
}

function playCard(params)
{
	var user = UserManager.getUser(params.userId);
	var room = RoomManager.getRoom(user.room);
	var LoveLetter = room.getGame();
	var Game = LoveLetter.getGame();

	if (LoveLetter.getActivePlayer().id != user.id) {
		// TODO error handling
		console.error('Nem Te vagy az aktív játékos!');
		return;
	}

	var card = LoveLetter.getCards().getById(params.cardId);
	if (Game.isCardNeedPrompt(card) && !params.guess) {
		params.html = _getGuessScreen(LoveLetter);
		socketHelper.emitToUser(user, 'card.prompt', params);

	} else if(Game.isCardNeedTarget(card, LoveLetter) && !params.target) {
		var targets = Game.getTargetablePlayers(card, LoveLetter);
		params.html = _getPlayerSelectorScreen(targets);
		socketHelper.emitToUser(user, 'card.target', params);

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
				var somebodyLost = Game.handleAttackingSituation(LoveLetter, player, targetPlayer, response.eventName);
				var templateParams = {
					'player': player.getPublicInfo(),
					'response': response,
					'somebodyList': somebodyLost,
					'targetPlayer': targetPlayer.getPublicInfo(),
				};
				var emitParams = {
					'history': _toastGuess(templateParams)
				};
				eventHandler.emitToRoom(room, response.eventName, emitParams);

				if (somebodyLost) {
					eventHandler.emitToRoom(room, 'game.playerLost', {'player': somebodyLost});
				}

				if (LoveLetter.isGameEnded()) {
					console.log('GAME ENDED!');
					LoveLetter.endGame();
				} else {
					LoveLetter.nextPlayer();
				}
			} catch(er) {
				console.log('Hiba történt a lap kijátszása közben:', er);
			}
		} else {
			// TODO nem lehet kijátszani, error handling
			console.log('Nem kijatszható a lap!');
		}
	}
}

function disconnect(socket)
{
	return function()
	{
		var user = UserManager.getUser(socket.id);
		if (user.room) {
			var room = RoomManager.getRoom(user.room);
			room.removeUser(user);
			var emitParams = {
				'playerCount': room.getUserIdList().length
			};
			socketHelper.emitToRoom(room, 'room.playerLeft', emitParams);
			var LoveLetter = room.getGame();
			if (LoveLetter && LoveLetter.isGameAlreadyStarted()) {
				LoveLetter.reset();
			}
		}
	};
}

/**
 * @param {Array} targetablePlayers
 * @returns {String}
 * @private
 */
function _getPlayerSelectorScreen(targetablePlayers)
{
	var params = {
		'players': targetablePlayers
	};
	return jade.renderFile('views/userSelect.jade', params);
}

/**
 * @param LoveLetter
 * @returns {String}
 * @private
 */
function _getGuessScreen(LoveLetter)
{
	var params = {
		'cards': LoveLetter.getCards().list
	};
	return jade.renderFile('views/guess.jade', params);
}

function _toastGuess(data)
{
	var params = {
		'toastType': 'info',
		'playerName': data.player.name,
		'targetName': data.targetPlayer.name,
		'cardName': data.response.card.name,
		'guessedCardName': data.response.params.guessCard.name,
	};
	return jade.renderFile('views/toast/guess.jade', params);
}