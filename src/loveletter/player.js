var utils  = require('./utils').utils;
var Cards  = require('./cards').cards;
var Events = require('./events').events;

/**
 * @param {int} id
 * @param {string} name
 * @returns {*}
 * @constructor
 */
function Player(id, name) {
	this.id          = id;
	this.name        = name;
	this.cardsInHand = [];
	this.wins        = 0;
	this.lost        = false;
	this.protection  = false;
	this.roomName    = null;
	eventHandler     = null;

	/*
	this.watch('cardsInHand', function(objectName, oldValue, newValue) {
		console.log(objectName);
		$('body').trigger(objectName, {value: newValue});
		return newValue;
	});
	*/

	/**
	 * @param {eventHandler} eventHandlerParam
	 * @param {Room|string} room
	 */
	this.setEventHandlerAndRoom = function(eventHandlerParam, room)
	{
		eventHandler = eventHandlerParam;
		this.roomName = room.name||room;
	};

	/**
	 * @param {boolean} showParams
	 * @returns {object}}
	 */
	this.getPublicInfo = function()
	{
		return {
			name: this.name,
			room: this.roomName,
			cardCount: this.cardsInHand.length,
			protection: !!this.protection,
			wins: this.wins
		};
	};

	/**
	 * Draw a card from deck
	 * @param {Deck} deck
	 * @param {boolean} silentEventFire
	 */
	this.draw = function(deck, silentEventFire)
	{
		var card = deck.draw();
		this.cardsInHand.push(card);

		if (Events.enabled && !silentEventFire) {
			eventHandler.emitToRoom(this.roomName, 'player.draw');
		}
	};

	/**
	 * Resolve 'attack' action
	 *
	 * @param {Game}   gameLogic
	 * @param {Card}   withCard     using this card
	 * @param {Player} targetPlayer targeted player
	 * @param {object} params       optional parameters
	 * @returns {*}
	 */
	this.attack = function(gameLogic, withCard, targetPlayer, params)
	{
		var cardResponse, eventName, publicParams = {};

		this.removeCard(withCard);

		switch (withCard.id) {
			case (8): // Princess
				throw 'Card not allowed to play!'; // You just can't!

			case (7): // Countess
				cardResponse = gameLogic.playCountess(this);
				eventName = 'game.playCountress';
				break;

			case (6): // King
				cardResponse = gameLogic.trade(this, targetPlayer);
				eventName = 'game.trade';
				break;

			case (5): // Prince
				cardResponse = gameLogic.discard(targetPlayer, params.deck);
				eventName = (cardResponse && cardResponse.id === 8) ? 'game.discard.win' : 'game.discard';
				break;

			case (4): // Handmaid
				cardResponse = gameLogic.protect(this);
				eventName = 'game.protect';
				break;

			case (3): // Baron
				cardResponse = gameLogic.fight(this.getTheCard(), targetPlayer.getTheCard());
				if (cardResponse === true) {
					eventName = 'game.fight.win';
				} else if (cardResponse === false) {
					eventName = 'game.fight.loose';
				} else {
					eventName = 'game.fight.equal';
				}

				publicParams.comparedCard = this.getTheCard();
				break;

			case (2): // Priest
				cardResponse = gameLogic.peek(targetPlayer);
				eventName = 'game.peek';
				publicParams.oppenentHand = targetPlayer.getTheCard();
				break;

			case (1): // Guard
				cardResponse = gameLogic.guess(params.guess, targetPlayer ? targetPlayer.getTheCard() : null);
				eventName = cardResponse ? 'game.guess.success' : 'game.guess.failed';
				publicParams.guessCard = Cards.getById(params.guess);
				break;

			default:
				throw new Error('Card Not Found');
		}

		return {
			params: publicParams,
			card: withCard,
			response: cardResponse,
			eventName: eventName
		};
	};

	this.clearHand = function()
	{
		this.cardsInHand = [];
	};

	return this;
}

/**
 * Get the only one card from player's hand
 *
 * @throw Error If player have more than one card
 * @returns {*}
 */
Player.prototype.getTheCard = function()
{
	if (this.cardsInHand.length > 1) {
		throw new Error('Túl sok kártya van a kézben!');
	}
	return this.cardsInHand[0];
};

/**
 * Ha két lapja van, visszaadja a nem megadott (másik) lapot
 * @param {Card} card
 * @returns {Card}
 */
Player.prototype.getAnotherCard = function(card)
{
	if (this.cardsInHand.length > 1) {
		return this.cardsInHand[0] == card ? this.cardsInHand[1] : this.cardsInHand[0];
	}
	return null;
};

/**
 * Remove a card from hand
 * @param {Card} card
 * @returns {boolean}
 */
Player.prototype.removeCard = function(card)
{
	if (typeof this.cardsInHand == "object" && this.cardsInHand.length === 0) {
		return false;
	}

	if (this.cardsInHand[0].id === card.id) {
		// remove first card
		this.cardsInHand.splice(0, 1);
	} else {
		// remove last (second) card
		this.cardsInHand.pop();
	}
	return true;
}

/**
 * Protect the player from targeting
 * @param {boolean} state
 */
Player.prototype.setProtection = function(state)
{
	this.protection = !!state;
};

/**
 * Is target player protected?
 * @returns {boolean}
 */
Player.prototype.isProtected = function()
{
	return !!this.protection;
};

/**
 * Discard player's hand
 * @param {Deck} deck  draw from here
 * @returns {*}
 */
Player.prototype.discardHand = function(deck)
{
	var discardedCard = this.getTheCard();
	// clear hand, draw a new card instead
	this.cardsInHand = [];
	this.draw(deck);
	return discardedCard;
};

/**
 * Is 'card' in player's hand
 * @param {Card} card
 * @returns {boolean}
 */
Player.prototype.isCardInHand = function(card)
{
	if (this.cardsInHand[0].id === card.id) {
		return true;
	}
	return this.cardsInHand[1] && this.cardsInHand[1].id === card.id;
};

/**
 * Rise win activePlayerCount for player
 */
Player.prototype.win = function()
{
	this.win++;
};

/**
 * Player loose the game (fall out from the game)
 */
Player.prototype.loose = function(appLogic)
{
	this.lost = true;
	this.clearHand();

	if (Events.enabled) {
		var params = {
			player: this,
			players: appLogic.getAllPlayers()
		};
		eventHandler.emitToUser(this.id, 'player.loose', null);
		eventHandler.emitToRoom(this.roomName, 'game.playerLoose', params);
	}
};

/**
 * At end of player's turn, update it
 */
Player.prototype.setDefault = function()
{
	this.lost = false;
	this.setProtection(false);
};

/**
 * At end of game, clean user for new game
 */
Player.prototype.cleanUp = function()
{
	this.clearHand();
	this.setDefault();
};

// Node export
exports.player = Player;