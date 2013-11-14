var Deck = require('./deck').Deck;
var utils = require('./utils').utils;

exports.cards = (function()
{
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
	 * Important constants
	 * @type {{LOOSE_THE_GAME: string, WIN_THE_GAME: string, COMPARE_HANDS: string, LOOK_AT_A_HAND: string, GUESS_A_HAND: string}}
	 */
	this.constants = {
		LOOSE_THE_GAME: 'Loose the game',
		WIN_THE_GAME:   'Win the game',
		COMPARE_HANDS:  'Compare Hands, lower hand is out',
		LOOK_AT_A_HAND: 'Look at a Hand',
		GUESS_A_HAND:   'Guess a player\'s hand',
	};

	this.list = {};
	this.list.princess = new Card(8, 'Princess', 1, 'Lose if discarded', this.constants.LOOSE_THE_GAME);
	this.list.countess = new Card(7, 'Countess', 1, 'Discard if caught with King or Prince', null);
	this.list.king     = new Card(6, 'King',     1, 'Trade Hands', null);
	this.list.prince   = new Card(5, 'Prince',   2, 'One player discard his or her hand', null);
	this.list.handmaid = new Card(4, 'Handmaid', 2, 'Protection unitl your next turn', null);
	this.list.baron    = new Card(3, 'Baron',    2, 'Compare Hands: lower hand is out', null);
	this.list.priest   = new Card(2, 'Priest',   2, 'Look at a hand', null);
	this.list.guard    = new Card(1, 'Guard',    5, 'Guess a player\'s hand', null);

	/**
	 * Get card by NAME
	 *
	 * @param name
	 * @returns new Card()
	 */
	this.get = function(name)
	{
		return this.list[name];
	};

	/**
	 * Get card by ID
	 *
	 * @param cardId
	 * @returns {*}
	 */
	this.getById = function(cardId)
	{
		for (var key in this.list) {
			if (this.list[key].id == cardId) {
				return this.list[key];
			}
		}
		return null;
	}

	/**
	 * @type {Function}
	 */
	this.create = Card;

	/**
	 * Generate costume decks
	 * @param {object} cards
	 * @returns {Deck}
	 */
	this.generateDeck = function(cards)
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
	this.generateDefaultDeck = function()
	{
		return this.generateDeck(this.list);
	};

	return this;
}());
