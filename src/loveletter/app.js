/**
 * @param {SocketHelper} eventHandler
 * @param {Room|string} room
 */
exports.App = function(eventHandler, room)
{
	var Utils  = require('./utils').utils;
	var Game   = require('./game').game;
	var Cards  = require('./cards').cards;
	var Player = require('./player').player;
	var Events = require('./events').events;

	var roomName = room.name || room;

	var gameStarted, activePlayerId, players, deck;

	/**
	 * @returns {boolean}
	 */
	this.isGameAlreadyStarted = function()
	{
		return !!gameStarted;
	};

	/**
	 * Create Game basics
	 *
	 * @param {Array} playerList
	 * @returns {*}
	 */
	this.createGame = function(playerList)
	{
		if (this.isGameAlreadyStarted()) {
			throw new Error('A játék már elkezdődött!');
		}

		var i;
		var length = playerList.length;
		if (playerList && length > 0) {
			for (i = 0; i < length; i++) {
				// TODO fix player's name
				player = new Player(playerList[i], playerList[i]);
				player.setEventHandlerAndRoom(eventHandler, room);
				this.addPlayer(player);
			}
		}
		return players;
	};

	/**
	 * @returns {game}
	 */
	this.getGame = function()
	{
		return Game;
	};

	/**
	 * @returns {cards}
	 */
	this.getCards = function()
	{
		return Cards;
	};

	/**
	 * Add a new player to the game if it isn't started
	 *
	 * @param {Player} player
	 * @throws {Error}
	 * @returns {boolean}
	 */
	this.addPlayer = function(player)
	{
		if (this.isGameAlreadyStarted()) {
			throw new Error('A játék már elkezdődött!');
		}

		var p;

		for (p in players) {
			if (players[p] && players[p].name == player.name && players[p].id != player.id) {
				throw new Error('Van már ilyen nevű játékos!');
			}
		}

		if (!player.id) {
			// generálunk neki ID-t, ha nem lenne
			player.id = parseInt(players.length + 1);
		}

		players.push(player);
		// TODO kell-e?
		// eventHandler.emitToRoom(roomName, 'game.newPlayer', player);
		return true;
	};

	/**
	 * Set next player to active player
	 *
	 * @returns {Player}
	 */
	this.nextPlayer = function()
	{
		++activePlayerId;
		if (activePlayerId >= players.length) {
			activePlayerId = 0;
		}
		var player = this.getActivePlayer()
		Game.nextTurnForPlayer(player, this.getDeck());
		eventHandler.emitToRoom(roomName, 'game.nextPlayer', player);
		return player;
	};

	/**
	 * Get active player
	 *
	 * @returns {Player}
	 */
	this.getActivePlayer = function()
	{
		return players[activePlayerId];
	};

	/**
	 * Get player by userId
	 *
	 * @param {User|string} user
	 * @returns {Player}
	 */
	this.getPlayer = function(user)
	{
		var userId = user.id || user;
		var players = this.getAllPlayers();
		return players.filter(function(player) {
			return player.id === userId;
		})[0];
	};

	/**
	 * Get ONLY ONE opponent
	 *
	 * @returns {Player}
	 */
	this.getOpponent = function()
	{
		if (this.getNumberOfPlayers() > 2) {
			throw Error('Kettönél több játékos esetén, nem használható!');
		}
		return this.getOpponents()[0];
	};

	/**
	 * Get ALL opponents
	 * TODO ez biztos jól megy így? getActivePlayer nem mindig az mint aki lekéri
	 *
	 * @returns {Array}
	 */
	this.getOpponents = function()
	{
		var userId = this.getActivePlayer().id;
		var players = this.getAllPlayers();
		return players.filter(function(player) {
			return player.id !== userId;
		});
	};

	/**
	 * Get non protected opponents
	 *
	 * @returns {Array}
	 */
	this.getNonProtectedOpponents = function()
	{
		var op = this.getOpponents();
		return op.filter(function(opponent) {
			return !opponent.isProtected();
		});
	};

	/**
	 * TODO nem biztos, hogy kell, lehet jól megy a getOpponents is
	 *
	 * @param {User|string} user
	 * @returns {Array}
	 */
	this.getPlayerOpponents = function(user)
	{
		var userId = user.id||user;
		var players = this.getAllPlayers();
		return players.filter(function(player) {
			return player.id !== userId;
		});
	};

	/**
	 * Get all player
	 *
	 * @returns {Array}
	 */
	this.getAllPlayers = function()
	{
		return players;
	};

	/**
	 * Number of players
	 *
	 * @returns {number}
	 */
	this.getNumberOfPlayers = function()
	{
		return players.length;
	};

	/**
	 * Get each player public infos
	 * @returns {Array}
	 */
	this.getPlayersDiggest = function()
	{
		var player,
			players = this.getAllPlayers(),
			playersDigest = [];
		for (var i in players) {
			player = players[i];
			playersDigest.push(
				player.getPublicInfo()
			);
		}
		return playersDigest;
	};

	/**
	 * @param {User|string} user
	 * @returns {{activePlayer: string, deckCount: int, players: Array, yourself: Player}}
	 */
	this.getGameUpdateMessage = function(user)
	{
		return {
			activePlayer: this.getActivePlayer().name,
			deckCount: this.getDeck().getCardinality(),
			players: this.getPlayersDiggest(),
			yourself: this.getPlayer(user.id||user)
		};
	};

	/**
	 * Get deck library
	 *
	 * @returns {Deck}
	 */
	this.getDeck = function()
	{
		return deck;
	};

	/**
	 * First time must be return true
	 *
	 * @returns {boolean}
	 */
	this.startGame = function()
	{
		if (this.isGameAlreadyStarted()) {
			// TODO FIXME for debug NOW
			// return;
		}
		gameStarted = true;

		// TODO something usefull at start

		deck.shuffle();
		deck.shuffle();
		deck.shuffle();

		var players = this.getAllPlayers();
		for (var i in players) {
			var player = players[i];
			player.draw(this.getDeck(), true); // silent draw
		}

		var activePlayer = this.getActivePlayer();
		Game.nextTurnForPlayer(activePlayer, this.getDeck());
		eventHandler.emitToRoom(roomName, 'game.start');
	};

	/**
	 * End of the Game
	 */
	this.endGame = function()
	{
		for (var i in players) {
			players[i].cleanUp();
		}
		this.getDeck().renew();
		gameStarted = false;
		// TODO winner player-t kiválasztani és visszaadni
		eventHandler.emitToRoom(roomName, 'game.end');
	};

	/**
	 * Reset gameplay to default
	 */
	this.reset = function()
	{
		gameStarted    = false;
		activePlayerId = 0;
		players        = [];
		deck           = Cards.generateDefaultDeck();
		eventHandler.emitToRoom(roomName, 'game.reset');
	};

	/**
	 * For debug!
	 *
	 * @returns {{players: Array, activePlayer: Player, deck: Deck, gameStarted: boolean}}
	 */
	this.debug = function()
	{
		return {
			players:      this.getAllPlayers(),
			activePlayer: this.getActivePlayer(),
			deck:         this.getDeck(),
			gameStarted:  !!gameStarted
		};
	};

	this.reset();
	return this;
};
