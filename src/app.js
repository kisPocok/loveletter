var utils  = require('./utils').utils;
var game   = require('./game').game;
var cards  = require('./cards').cards;
var player = require('./player').player;
var events = require('./events').events;

var App = (function(Game, Cards, Player, Events, Utils)
{
	var instance;
	var self = {};

	function init()
	{
		var gameStarted, activePlayerId, players, deck;

		/**
		 * Add a new player to the game if it isn't started
		 *
		 * @param {Player} player
		 * @throws {Error}
		 * @returns {boolean}
		 */
		self.addPlayer = function(player)
		{
			if (gameStarted) {
				throw new Error('A játék már elkezdődött!');
			}

			for (var p in players) {
				if (players[p] && players[p].name == player.name && players[p].id != player.id) {
					throw new Error('Van már ilyen nevű játékos!');
				}
			}

			if (!player.id) {
				// generálunk neki ID-t, ha nem lenne
				player.id = parseInt(players.length + 1)
			}

			players.push(player);
			Events.fire('game.newPlayer', player);
			return true;
		};

		/**
		 * Set next player to active player
		 *
		 * @returns {Player}
		 */
		self.nextPlayer = function()
		{
			++activePlayerId;
			if (activePlayerId >= players.length) {
				activePlayerId = 0;
			}
			var player = self.getActivePlayer()
			Game.nextTurnForPlayer(player, self.getDeck());
			Events.fire('game.nextPlayer', player);
			return player;
		};

		/**
		 * Get active player
		 *
		 * @returns {Player}
		 */
		self.getActivePlayer = function()
		{
			return players[activePlayerId];
		};

		/**
		 * Get player by userId
		 *
		 * @returns {Player}
		 */
		self.getPlayer = function(userId)
		{
			return players[userId];
		};

		/**
		 * Get ONLY ONE opponent
		 *
		 * @returns {Player}
		 */
		self.getOpponent = function()
		{
			if (self.getNumberOfPlayers() > 2) {
				throw Error('Kettönél több játékos esetén, nem használható!');
			}
			return self.getOpponents()[0];
		};

		/**
		 * Get ALL opponents
		 *
		 * @returns {Array}
		 */
		self.getOpponents = function()
		{
			var userId = self.getActivePlayer().id;
			var players = self.getAllPlayers();
			return players.filter(function(player) {
				return player.id !== userId;
			});
		};

		/**
		 * Get all player
		 *
		 * @returns {Array}
		 */
		self.getAllPlayers = function()
		{
			return players;
		};

		/**
		 * Number of players
		 *
		 * @returns {number}
		 */
		self.getNumberOfPlayers = function()
		{
			return players.length;
		};

		/**
		 * Get deck library
		 *
		 * @returns {Deck}
		 */
		self.getDeck = function()
		{
			return deck;
		};

		/**
		 * First time must be return true
		 *
		 * @returns {boolean}
		 */
		self.startGame = function()
		{
			if (gameStarted) {
				// TODO FIXME for debug NOW
				// return false;
			}
			// TODO FIXME
			// gameStarted = true;

			// TODO something usefull at start

			deck.shuffle();
			deck.shuffle();
			deck.shuffle();

			for (var i in players) {
				players[i].draw(self.getDeck());
			}
			var player = self.getActivePlayer();
			Game.nextTurnForPlayer(player, self.getDeck());
			var params = {
				players: players,
				deck:    deck,
				game:    Game
			};
			Events.fire('game.start', params);
			return true;
		};

		/**
		 * End of the Game
		 */
		self.endGame = function()
		{
			for (var i in players) {
				players[i].cleanUp();
			}
			self.getDeck().renew();
			gameStarted = false;
			// TODO winner player-t kiválasztani és visszaadni
			Events.fire('game.end');
		};

		/**
		 * Reset gameplay to default
		 */
		self.reset = function()
		{
			gameStarted    = false;
			activePlayerId = 0;
			players        = [];
			deck           = Cards.generateDefaultDeck();
			Events.fire('game.reset');
			return self;
		};

		/**
		 * For debug!
		 *
		 * @returns {{players: Array, activePlayer: Player, deck: Deck, gameStarted: boolean}}
		 */
		self.debug = function()
		{
			return {
				players:      self.getAllPlayers(),
				activePlayer: self.getActivePlayer(),
				deck:         self.getDeck(),
				gameStarted:  !!gameStarted
			};
		};

		return self.reset();
	}

	return {
		// Get the Singleton instance if one exists
		// or create one if it doesn't
		getInstance: function () {
			if ( !instance ) {
				instance = init();
			}
			return instance;
		}

	};
}(game, cards, player, events, utils));

// Node export
exports.app = App.getInstance();