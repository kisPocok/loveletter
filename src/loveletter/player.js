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
	 * @param {socketHandler} eventHandler
	 * @param {Room|string} room
	 */
	this.setEventHandler = function(eventHandlerParam, room)
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
	 */
	this.draw = function(deck)
	{
		var card = deck.draw();
		this.cardsInHand.push(card);
		eventHandler.emitToRoom(this.roomName, 'player.draw');
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
 * Resolve 'attack' action
 *
 * @param {Game}   gameLogic    outsourced for debug mock
 * @param {Card}   withCard     using this card
 * @param {Player} targetPlayer targeted player
 * @param {object} params       optional parameters
 * @returns {*}
 */
Player.prototype.attack = function(gameLogic, withCard, targetPlayer, params)
{
	this.removeCard(withCard);
	var response;

	switch (withCard.id) {
		case (8): // Princess
			// You can't!
			throw new Error('Card not allowed to play!');
			break;
		case (7): // Countess
			response = gameLogic.playCountess(this);
			Events.fire('game.playCountress');
			break;
		case (6): // King
			response = gameLogic.trade(this, targetPlayer);
			Events.fire('game.trade');
			break;
		case (5): // Prince
			response = gameLogic.discard(targetPlayer, params.deck);
			if (response && response.id === 8) {
				// princess
				Events.fire('game.discard.win');
				targetPlayer.loose(gameLogic);
			} else {
				Events.fire('game.discard');
			}
			break;
		case (4): // Handmaid
			response = gameLogic.protect(this);
			Events.fire('game.protect');
			break;
		case (3): // Baron
			response = gameLogic.fight(this.getTheCard(), targetPlayer.getTheCard());
			if (response === true) {
				Events.fire('game.fight.win');
				targetPlayer.loose(gameLogic);
			} else if (response === false) {
				Events.fire('game.fight.loose');
				this.loose(gameLogic);
			} else {
				Events.fire('game.fight.equal');
			}
			break;
		case (2): // Priest
			response = gameLogic.peek(targetPlayer);
			if (response) {
				var eventParams = {
					player: this,
					targetPlayer: targetPlayer
				};
				Events.fire('game.peek', eventParams);
			}
			break;
		case (1): // Guard
			response = gameLogic.guess(params.guess, targetPlayer ? targetPlayer.getTheCard() : null);
			if (response) {
				Events.fire('game.guess.success');
				targetPlayer.loose(gameLogic);
			} else {
				Events.fire('game.guess.failed');
			}
			break;
		default:
			throw new Error('Card Not Found');
			break;
	}

	var triggerParams = {
		player:   this,
		card:     withCard,
		target:   targetPlayer,
		params:   params,
		response: response
	};
	Events.fire('player.attack', triggerParams);
	return response;
};

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
Player.prototype.loose = function(gameLogic)
{
	var newPlayers = [];
	for (var i in gameLogic.players) {
		var aPlayer = gameLogic.players[i];
		if (aPlayer.id != this.id) {
			newPlayers.push(aPlayer);
		}
	}
	gameLogic.players = newPlayers;

	var params = {
		player:  this,
		players: newPlayers
	};
	Events.fire('player.loose', params);
};

/**
 * At end of player's turn, update it
 */
Player.prototype.setDefault = function()
{
	this.setProtection(false);
};

/**
 * At end of game, clean user for new game
 */
Player.prototype.cleanUp = function()
{
	this.cardsInHand = [];
	this.setDefault();
};

// Node export
exports.player = Player;