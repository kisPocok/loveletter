var SocketHelper = require('./socketHelper').SocketHelper;
var RoomManager = require('./roomManager').RoomManager();
var UserManager = require('./UserManager').UserManager();
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
	socketHelper = new SocketHelper(socket);
	user = new User(socket.id);
	UserManager.addUser(user);

	var emitParams = {
		userId: user.id
	};

	/**
	 * TODO part I.
	 * - handshake az aktuális játékossal, küldjük ki neki egyedi userId-t!
	 * - léptessük be a játékost a 'queue' szobába, a várakozók közé
	 */

	socket.on('room.join', joinRoom);
	socket.on('game.start', startTheGame);
	socket.on('game.getUpdates', getUpdates);
	socket.on('game.playCard', playCard);

	// TODO part IV. disconnect megvalósítása
};

function joinRoom(params)
{
	/**
	 * TODO part I.
	 * - a játékos be van-e lépve már a szobába?
	 *   - ha igen, ne fusson tovább a kód
	 * - felhasználónál rögzíteni a szobát
	 * - játékost beléptetni a szobába
	 * - értesíteni a szobát, hogy egy játékos belépett + frissíteni kell a queue számlálót
	 */
}

function startTheGame(params)
{
	/**
	 * TODO part I.
	 * - van-e aktív játék?
	 *   - ha van szólni a jatekosnak, hogy gebasz van!
	 * - új játék létrehozása. Legyen egy DEV és egy PROD verzió is!
	 * - szobába a játék logikáját rögzítsétek
	 */
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

	/**
	 * TODO part III.
	 * Minden jatekos lapkijatszasa beesik, nem csak a soron kovetkezoe.
	 * - ertesitsuk a jatekost, ha nem ő az aktív játékos!
	 */

	var card = LoveLetter.getCards().getById(params.cardId);
	if (Game.isCardNeedPrompt(card) && !params.guess) {
		/**
		 * TODO part III.
		 * - küldj ki egy 'guess' screent!
		 */

	} else if(Game.isCardNeedTarget(card, LoveLetter) && !params.target) {
		/**
		 * TODO part III.
		 * - küldj ki egy 'playerSelector' screent!
		 */

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

				/**
				 * TODO part III.
				 * Ellenőrízni kell, hogy a játék véget ért-e.
				 * - Ha igen, értesíteni minden játékost róla
				 * - Ha nem, jöhet következő játékos
				 */

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
	/**
	 * TODO part IV.
	 * - ha a felhasználónak van szobája
	 *   - vegyük ki a szobából
	 *   - szóljunk a többi játékosnak a szobában, hogy létszám változás történt
	 *   - ha van aktív játék a szobában
	 *     - reseteljük le
	 */
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
	var eventParams = {};
	/**
	 * TODO part III.
	 * Nincs minden kártya visszajelzése implementálva még. Válassz ki egyet és fejleszd le.
	 */
	switch (card.id) {
		case (3):
			eventParams.history = Toaster.baron(player.getPublicInfo(), targetPlayer.getPublicInfo(), card, response.params.comparedCard);
			break;
		case (1):
			eventParams.history = Toaster.guard(player.getPublicInfo(), targetPlayer.getPublicInfo(), card, response.params.guessCard);
			break;
		default:
			// TODO
			break;
	}
	socketHelper.emitToRoom(room, response.eventName, eventParams);
}
