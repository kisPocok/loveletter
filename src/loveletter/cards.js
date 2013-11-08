var utils = require('./utils').utils;

var Cards = (function(utils)
{
	var self = {};

	/**
	 * @param {int}      id
	 * @param {string}   name
	 * @param {int}      quantity
	 * @param {string}   description
	 * @param {function} onDrop optional
	 * @returns {*}
	 * @constructor
	 */
	function Card(id, name, quantity, description, onDrop) {
		this.id          = id;
		this.name        = name;
		this.description = description;
		this.quantity    = quantity||1;
		this.onDrop      = utils.isFunction(onDrop) ? onDrop : function() { return onDrop; };
		return this;
	}

	/**
	 * @param cardList
	 * @returns {*}
	 * @constructor
	 */
	function Deck(cardList) {
		this.originalCards = cardList;
		this.cards         = cardList;

		/**
		 * Draw a card
		 * @returns {*}
		 */
		this.draw = function()
		{
			var card = this.cards[0];
			this.cards.splice(0, 1);
			return card;
		};

		/**
		 * Shuffle your deck
		 */
		this.shuffle = function()
		{
			var o = this.cards;
			// TODO array shuffle! :)
			for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {
				// for statement have empty body
			}
			this.cards = o;
		};

		/**
		 * Rebuild deck
		 */
		this.renew = function()
		{
			this.cards = this.originalCards;
		};

		return this;
	}

	/**
	 * Important constants
	 * @type {{LOOSE_THE_GAME: string, WIN_THE_GAME: string, COMPARE_HANDS: string, LOOK_AT_A_HAND: string, GUESS_A_HAND: string}}
	 */
	self.constants = {
		LOOSE_THE_GAME: 'Loose the game',
		WIN_THE_GAME:   'Win the game',
		COMPARE_HANDS:  'Compare Hands, lower hand is out',
		LOOK_AT_A_HAND: 'Look at a Hand',
		GUESS_A_HAND:   'Guess a player\'s hand',
	};

	self.list = {};
	self.list.princess = new Card(8, 'Princess', 1, 'Lose if discarded', self.constants.LOOSE_THE_GAME);
	self.list.countess = new Card(7, 'Countess', 1, 'Discard if caught with King or Prince', null);
	self.list.king     = new Card(6, 'King',     1, 'Trade Hands', null);
	self.list.prince   = new Card(5, 'Prince',   2, 'One player discard his or her hand', null);
	self.list.handmaid = new Card(4, 'Handmaid', 2, 'Protection unitl your next turn', null);
	self.list.baron    = new Card(3, 'Baron',    2, 'Compare Hands: lower hand is out', null);
	self.list.priest   = new Card(2, 'Priest',   2, 'Look at a hand', null);
	self.list.guard    = new Card(1, 'Guard',    5, 'Guess a player\'s hand', null);

	/**
	 * Get card by NAME
	 *
	 * @param name
	 * @returns new Card()
	 */
	self.get = function(name)
	{
		return self.list[name];
	};

	/**
	 * Get card by ID
	 *
	 * @param cardId
	 * @returns {*}
	 */
	self.getById = function(cardId)
	{
		for (var key in self.list) {
			if (self.list[key].id == cardId) {
				return self.list[key];
			}
		}
		return null;
	}

	/**
	 * @type {Function}
	 */
	self.create = Card;

	/**
	 * Generate costume decks
	 * @param {object} cards
	 * @returns {Deck}
	 */
	self.generateDeck = function(cards)
	{
		var cardList = [];
		for (var i in cards) {
			var card = cards[i];
			for (var j = 0; j < card.quantity; j++) {
				cardList.push(card);
			}
		}
		return new Deck(cardList);
	};

	/**
	 * Generate sample deck
	 * @returns {*}
	 */
	self.generateDefaultDeck = function()
	{
		return self.generateDeck(self.list);
	};

	return self;
}(utils));

// Node export
exports.cards = Cards;