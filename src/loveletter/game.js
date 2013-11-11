var utils = require('./utils').utils;
var cards = require('./cards').cards;

/**
 * Game Module
 */
var Game = (function(Cards)
{
	var self = {};

	/**
	 * @param {int}  guess  guessed number
	 * @param {Card} card
	 * @returns {boolean}
	 */
	self.guess = function(guess, card)
	{
		if (card === null) {
			return null;
		}

		if (!utils.isInt(guess) || guess > 8 || guess <= 1) {
			throw new Error('Nem érvényes kártya!');
		}
		return guess === card.id;
	};

	/**
	 * Look target player's hand
	 * @param {Player} targetPlayer
	 * @return {boolean}
	 */
	self.peek = function(targetPlayer)
	{
		// TODO show hand
		return !targetPlayer.isProtected();
	};

	/**
	 * @param {Card} card1
	 * @param {Card} card2
	 * @return {boolean|null}
	 */
	self.fight = function(card1, card2)
	{
		if (card2 === null) {
			return null;
		}

		if (card1.id === card2.id) {
			// Draw. Equal.
			return null;
		}
		return card1.id > card2.id;
	};

	/**
	 * Protect yourself for 1 turn
	 * @param {Player} player
	 */
	self.protect = function(player)
	{
		player.setProtection(true);
	};

	/**
	 * Discard player's hand and draw new card later
	 * @param {Player} player
	 * @param {Deck}   deck
	 * @return {boolean|string}
	 */
	self.discard = function(player, deck)
	{
		if (!player.isProtected()) {
			// discard
			return player.discardHand(deck);
		}
		return false;
	};

	/**
	 * Trade hands between 2 players
	 * @param {Player} player1
	 * @param {Player} player2
	 */
	self.trade = function(player1, player2)
	{
		if (player2 === null) {
			// nincs lehetséges célpont, nincs hatása a lapnak
			return true;
		}

		if (player1 != player2 && !player2.protection) {
			var p1cards = player1.cardsInHand;
			player1.cardsInHand = player2.cardsInHand;
			player2.cardsInHand = p1cards;
			return true;
		}
		return false;
	};

	/**
	 * @param {Card}   card
	 * @param {Player} player
	 * @param {Player} targetPlayer
	 * @param {*}      params
	 * @returns {string|false}
	 */
	self.getErrorsIfNotPlayableCard = function(card, player, targetPlayer, params)
	{
		if (player.cardsInHand.length != 2) {
			// minimum 2 kártya kell
			return self.errors.MUST_BE_2_CARDS;
		}

		if (!player.isCardInHand(card)) {
			// nincs a kártya a kezében
			return self.errors.CARD_NOT_ISSET;
		}

		if (targetPlayer && targetPlayer.isProtected()) {
			// a célpont védett
			return self.errors.TARGET_PROTECTED;
		}

		if (card == Cards.get('baron') && targetPlayer === player) {
			// baron nem célozhatja önmagát
			return self.errors.BARON_TARGETED_HIMSELF;
		}

		if ((card == Cards.get('king') || card == Cards.get('princess')) && player.getAnotherCard(card) == Cards.get('countess')) {
			// ha king és cuntess van a kézben, countess-t kell kijátszani
			return self.errors.MUST_PLAY_COUNTESS;
		}

		if (card == Cards.get('princess')) {
			// princess-t nem lehet kijátszani soha
			return self.errors.PRINCESS_CANNOT_BE_PLAYED;
		}

		// guard guess 1-nél nagyobb kell legyen
		if (card == Cards.get('guard') && (params.guess <= 1 || params.guess > 8)) {
			return self.errors.WRONG_GUESS_NUMBER;
		}

		return false;
	};


	/**
	 * Kártya ellenőrzése, hogy kijátszható-e az adott szituációban
	 * @param {Card} card
	 * @param {Player} player
	 * @param {Player} targetPlayer
	 * @returns {boolean}
	 */
	self.isPlayableCard = function(card, player, targetPlayer, params)
	{
		return !self.getErrorsIfNotPlayableCard(card, player, targetPlayer, params);
	};

	/**
	 * @param {Card} card
	 * @returns {boolean}
	 */
	self.isCardNeedPrompt = function(card)
	{
		return card.id === 1;
	};

	/**
	 * Is player need to choose target for active card?
	 * @param {Card} card
	 * @param {App}  appLogic
	 * @returns {boolean}
	 */
	self.isCardNeedTarget = function(card, appLogic)
	{
		switch (card.id) {
			case (6): // Trade Hands, fall-through
			case (3): // Compare Hands: lower hand is out, fall-through
			case (2): // Look at a hand, fall-through
			case (1): // Guess a player's hand, fall-through
				// ha van legalább 1 ellenfél aki célozható
				return !!self.getNumberOfPossibleTarget(appLogic.getOpponents());
			case (5): // One player discard his or her hand
				// mindig van legalább egy (hiszen önmaga is célpont lehet) ezért mindig választania kell
				// akkor is, ha nincs aktív ellenfél, hogy értse mi történik!
				return true;
			default:
				return false;
		}
	};

	/**
	 * Count number of possible targets in a case
	 *
	 * Megadsz egy felhasználói listát, leszámolja belőle, hogy hány LEHETSÉGES célpont van benne.
	 * A 'min'-nek megadod hány lehetséges célponttól kell kitenni
	 *
	 * @param {Array}  players Any list of players
	 * @param {number} min     Minimum number of target what is need to active
	 * @returns {boolean}
	 */
	self.getNumberOfPossibleTarget = function(players)
	{
		var numberOfTarget = 0;
		for (var p in players) {
			if (!players[p].isProtected()) {
				++numberOfTarget;
			}
		}
		return numberOfTarget;
	};

	self.errors = {
		MUST_BE_2_CARDS:           "Legalább két kártyának lennie kell a kezedben!",
		CARD_NOT_ISSET:            "Nincs ilyen kártya a kezedben",
		TARGET_PROTECTED:          "A célpont védett",
		BARON_TARGETED_HIMSELF:    "Baron nem célozhatja önmagát",
		PRINCESS_CANNOT_BE_PLAYED: "A princess-t nem lehet kijátszani",
		MUST_PLAY_COUNTESS:        "Countess-t kell kijátszanod, ha Princess vagy King van a kezedben",
		WRONG_GUESS_NUMBER:        "Nem lehet ilyen számot megadni a guard-nak"
	};

	/**
	 * @param player
	 */
	self.playCountess = function(player)
	{
		return false;
	};

	/**
	 * Start a new turn for a player
	 * @param {Player} player
	 * @param {Deck}   deck
	 */
	self.nextTurnForPlayer = function(player, deck)
	{
		try {
			player.getTheCard(); // check to have no more than 1 card in hand
			player.setDefault();
			player.draw(deck);
			return true;
		} catch (er) {
			return false;
		}
	};

	return self;
}(cards));

// Node export
exports.game = Game;