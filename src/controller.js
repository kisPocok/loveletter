var SocketHelper = require('./socketHelper').SocketHelper;
var RoomManager = require('./roomManager').RoomManager();
var UserManager = require('./userManager').UserManager();
var Toaster = require('./toast').Toast();
var Screen = require('./screen').Screen();
var User = require('./user').User;
var jade = require('jade');

var socketHelper, user, devMode = (process.env.DEV == 1);

/**
 * @type {function}
 * @param {socket} socket
 */
exports.initApplication = function(socket)
{
	console.log('SOCKET', socket.id);
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
			cards.priest,
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

	console.log('playCard', params);

	if (LoveLetter.getActivePlayer().id != user.id) {
		// TODO error handling
		console.error('Nem Te vagy az aktív játékos!');
		socketHelper.emitToUser(user, 'player.notActivePlayer');
		return;
	}

	var card = LoveLetter.getCards().getById(params.cardId);
	if (Game.isCardNeedPrompt(card) && !params.guess) {
		params.html = Screen.guess(LoveLetter);
		socketHelper.emitToUser(user, 'card.prompt', params);

	} else if(Game.isCardNeedTarget(card, LoveLetter) && !params.target) {
		var targets = Game.getTargetablePlayers(card, LoveLetter);
		params.html = Screen.playerSelector(targets);
		socketHelper.emitToUser(user, 'card.target', params);

	} else {
		var player = LoveLetter.getPlayer(user);
		var targetPlayer = LoveLetter.getPlayer(params.target||user);
		var isPlayable = Game.isPlayableCard(card, player, targetPlayer, params.extraParams);

		if (isPlayable) {
			try {
				if (card.id === 5) {
					params.deck = LoveLetter.getDeck();
				}
				var response = player.attack(Game, card, targetPlayer, params);
				var somebodyLost = Game.handleAttackingSituation(LoveLetter, player, targetPlayer, response.eventName);
				toastEvent(room, player, targetPlayer, card, response);

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
 * @param {Room} room
 * @param {Player} player
 * @param {Player} targetPlayer
 * @param {Card} card
 * @param {Object} response
 */
function toastEvent(room, player, targetPlayer, card, response)
{
	var playerPublicInfo = player.getPublicInfo();
	var targetPublicInfo = targetPlayer.getPublicInfo();
	var eventParams = {};
	switch (card.id) {
		case (3):
			eventParams.history = Toaster.baron(playerPublicInfo, targetPublicInfo, card, response.params.comparedCard);
			socketHelper.emitToRoom(room, response.eventName, eventParams);
			break;
		case (2):
			eventParams.history = Toaster.priest(playerPublicInfo, targetPublicInfo, card);
			socketHelper.emitToRoomExceptCurrent(room, response.eventName, eventParams);

			eventParams.history = Toaster.priestYourself(playerPublicInfo, targetPublicInfo, card, response.params.oppenentHand);
			socketHelper.emitToUser(player.id, response.eventName, eventParams);
			break;
		case (1):
			eventParams.history = Toaster.guard(playerPublicInfo, targetPublicInfo, card, response.params.guessCard);
			socketHelper.emitToRoom(room, response.eventName, eventParams);
			break;
		default:
			// TODO
			break;
	}
}
