// Game requirements
var Utils  = require('../src/loveletter/utils').utils,
	Cards  = require('../src/loveletter/cards').cards,
	Game   = require('../src/loveletter/game').game,
	Events = require('../src/loveletter/events').events,
	Player = require('../src/loveletter/player').player;

// Disable event firing while testing
Events.disable();

var App = require('../src/loveletter/app').App;
var socketHandlerMock = jasmine.createSpyObj('socketHandler', ['emitToRoom']);
App = new App(socketHandlerMock, 'test');

function using(values, func)
{
	for (var i = 0, count = values.length; i < count; i++) {
		if (Object.prototype.toString.call(values[i]) !== '[object Array]') {
			values[i] = [values[i]];
		}
		func.apply(this, values[i]);
		//jasmine.currentEnv_.currentSpec.description += ' (with "' + name + '" using ' + values[i].join(', ') + ')';
	}
}

/**
 * For debug purposes
 */
Player.prototype.setHand = function()
{
	this.cardsInHand = [];
	for (var i in arguments) {
		this.cardsInHand.push(arguments[i]);
	}
};

var guard    = Cards.get('guard');
var priest   = Cards.get('priest');
var baron    = Cards.get('baron');
var handmaid = Cards.get('handmaid');
var prince   = Cards.get('prince');
var king     = Cards.get('king');
var countess = Cards.get('countess');
var princess = Cards.get('princess');

describe("Cards", function() {
	it("Overall check", function() {
		var cardId  = 1;
		var cardQty = 2;
		var callbackString = 12345;
		var card = new Cards.create(cardId, 'irrelevant', cardQty, 'irrelevant', callbackString);
		expect(cardId).toBe(card.id);
		expect(cardQty).toBe(card.quantity);
		expect(callbackString).toBe(card.onDrop());

		var callbackFunction = function() { return 'alma'; };
		var card2 = new Cards.create(cardId, 'irrelevant', cardQty, 'irrelevant', callbackFunction);
		expect(callbackFunction).toBe(card2.onDrop);
	});

	it("Getter", function() {
		expect(6).toBe(Cards.get('king').id);
		expect(undefined).toBe(Cards.get('wrong-card-name'));
	});

	it("Princess", function() {
		expect(8).toBe(Cards.get('princess').id);
		expect(1).toBe(Cards.get('princess').quantity);
		expect(Cards.constants.LOOSE_THE_GAME).toBe(Cards.get('princess').onDrop());
	});

	it("Countess", function() {
		expect(7).toBe(Cards.get('countess').id);
		expect(1).toBe(Cards.get('countess').quantity);
	});

	it("King", function() {
		expect(6).toBe(Cards.get('king').id);
		expect(1).toBe(Cards.get('king').quantity);
	});

	/*
	using("valid values", ["abc", "longusername", "john_doe"], function(value){
		it("should return true for valid usernames", function() {
			expect(validateUserName(value)).toBeTruthy();
		})
	})
	*/
});

describe("Deck", function() {
	it("cardLimit", function() {
		var deck = Cards.generateDefaultDeck();
		expect(16).toBe(deck.cards.length);
	});
});

describe("Player.basics", function() {
	var deck = Cards.generateDefaultDeck();
	var p1   = new Player(1, 'irrelevant');

	it("draw", function() {
		expect(p1.cardsInHand.length).toEqual(0);
		p1.draw(deck);
		expect(p1.cardsInHand.length).toEqual(1);
		p1.draw(deck);
		expect(p1.cardsInHand.length).toEqual(2);
	});

	it("set hand", function() {
		p1.setHand(guard, princess);
		expect(p1.cardsInHand.length).toEqual(2);
		expect(guard).toBe(p1.cardsInHand[0]);
		expect(princess).toBe(p1.cardsInHand[1]);
	});

	it("next turn, too many times", function() {
		var deck = Cards.generateDefaultDeck();
		p1.setHand(guard);
		expect(Game.nextTurnForPlayer(p1, deck)).toBeTruthy();
		expect(Game.nextTurnForPlayer(p1, deck)).toBeFalsy();
	});
});

describe("Player.Attack", function() {
	beforeEach(function() {
		p1 = new Player(1, 'irrelevant');
		p1.setEventHandlerAndRoom(socketHandlerMock, 'test');
		p2 = new Player(2, 'irrelevant');
		p2.setEventHandlerAndRoom(socketHandlerMock, 'test');
		gameLogicMock = Utils.clone(Game);
	});

	it("guard", function() {
		var guessNumber = princess.id;
		p2.setHand(princess);
		gameLogicMock.guess = jasmine.createSpy("mock guess");
		p1.attack(gameLogicMock, guard, p2, {guess: guessNumber});
		expect(gameLogicMock.guess).toHaveBeenCalledWith(guessNumber, princess);
	});

	it("priest", function() {
		gameLogicMock.peek = jasmine.createSpy("mock peek");
		p1.attack(gameLogicMock, priest, p2);
		expect(gameLogicMock.peek).toHaveBeenCalledWith(p2);
	});

	it("baron", function() {
		p1.setHand(princess, baron);
		p2.setHand(guard);
		gameLogicMock.fight = jasmine.createSpy("mock fight");
		p1.attack(gameLogicMock, baron, p2);
		expect(gameLogicMock.fight).toHaveBeenCalledWith(princess, guard);
	});

	it("handmaid", function() {
		gameLogicMock.protect = jasmine.createSpy("mock protection");
		p1.attack(gameLogicMock, handmaid);
		expect(gameLogicMock.protect).toHaveBeenCalledWith(p1);
	});

	it("prince", function() {
		var deck = Cards.generateDefaultDeck();
		gameLogicMock.discard = jasmine.createSpy("mock discard");
		p1.attack(gameLogicMock, prince, p1, {deck: deck});
		expect(gameLogicMock.discard).toHaveBeenCalledWith(p1, deck);
	});

	it("King", function() {
		gameLogicMock.trade = jasmine.createSpy("mock trade hand");
		p1.attack(gameLogicMock, king, p2);
		expect(gameLogicMock.trade).toHaveBeenCalledWith(p1, p2);
	});

	it("Countess", function() {
		gameLogicMock.playCountess = jasmine.createSpy("mock countess placement");
		p1.attack(gameLogicMock, countess);
		expect(gameLogicMock.playCountess).toHaveBeenCalledWith(p1);
	});

	it("Princess", function() {
		expect(p1.attack.bind(this, App, princess)).toThrow();
	});
});

describe("Game.getNumberOfPossibleTarget", function() {
	beforeEach(function() {
		p1 = new Player(1, 'irrelevant');
		p2 = new Player(2, 'irrelevant 2');
		p3 = new Player(3, 'irrelevant 3');
	});

	it("1 target", function() {
		expect(Game.getNumberOfPossibleTarget([p1])).toBeTruthy();
	});

	it("more targets", function() {
		var p4 = new Player(4, 'irrelevant 4');
		expect(Game.getNumberOfPossibleTarget([p1, p2])).toBeTruthy();
		expect(Game.getNumberOfPossibleTarget([p1, p2, p3])).toBeTruthy();
		expect(Game.getNumberOfPossibleTarget([p1, p2, p3, p4])).toBeTruthy();
	});

	it("1 target with protection", function() {
		p1.setProtection(true);
		expect(Game.getNumberOfPossibleTarget([p1])).toBeFalsy();
	});

	it("2 targets with 1 protection", function() {
		p1.setProtection(true);
		expect(Game.getNumberOfPossibleTarget([p1, p2])).toBeTruthy();
	});

	it("2 targets with 2 protections", function() {
		p1.setProtection(true);
		p2.setProtection(true);
		expect(Game.getNumberOfPossibleTarget([p1, p2])).toBeFalsy();
	});

	it("more than 2 targets with maximum (2) protections", function() {
		p1.setProtection(true);
		p2.setProtection(true);
		expect(Game.getNumberOfPossibleTarget([p1, p2, p3])).toBeTruthy();
	});
});

describe("Game.isCardNeedPrompt", function() {
	it("guard card", function() {
		expect(Game.isCardNeedPrompt(guard)).toBeTruthy();
	});

	it("other cards", function() {
		expect(Game.isCardNeedPrompt(princess)).toBeFalsy();
		expect(Game.isCardNeedPrompt(countess)).toBeFalsy();
		expect(Game.isCardNeedPrompt(king)).toBeFalsy();
		expect(Game.isCardNeedPrompt(prince)).toBeFalsy();
		expect(Game.isCardNeedPrompt(handmaid)).toBeFalsy();
		expect(Game.isCardNeedPrompt(baron)).toBeFalsy();
		expect(Game.isCardNeedPrompt(priest)).toBeFalsy();
	});
});

describe("Game.getTargetablePlayers", function()
{
	var p1, p2, onlyP1, onlyP2, noPlayer, p1p2;

	beforeEach(function()
	{
		p1 = new Player(1, 'irrelevant');
		p2 = new Player(2, 'irrelevant 2');
		p3 = new Player(3, 'irrelevant 3');
		App.reset();
		App.addPlayer(p1);
		App.addPlayer(p2);

		noPlayer = [];
		p1p2 = [p1, p2];
		onlyP1 = [p1];
		onlyP2 = [p2];
	});

	it("2 players cases", function()
	{
		expect(Game.getTargetablePlayers(princess, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(countess, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(king, App)).toEqual(onlyP2);
		expect(Game.getTargetablePlayers(prince, App)).toEqual(p1p2);
		expect(Game.getTargetablePlayers(handmaid, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(baron, App)).toEqual(onlyP2);
		expect(Game.getTargetablePlayers(priest, App)).toEqual(onlyP2);
		expect(Game.getTargetablePlayers(guard, App)).toEqual(onlyP2);
	});

	it("2 players cases with protected opponents", function()
	{
		p2.setProtection(true);

		expect(Game.getTargetablePlayers(princess, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(countess, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(king, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(prince, App)).toEqual(onlyP1);
		expect(Game.getTargetablePlayers(handmaid, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(baron, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(priest, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(guard, App)).toEqual(noPlayer);
	});

	it("3 players cases with 1 protected opponents", function()
	{
		p3.setProtection(true);
		App.addPlayer(p3);

		expect(Game.getTargetablePlayers(princess, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(countess, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(king, App)).toEqual(onlyP2);
		expect(Game.getTargetablePlayers(prince, App)).toEqual(p1p2);
		expect(Game.getTargetablePlayers(handmaid, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(baron, App)).toEqual(onlyP2);
		expect(Game.getTargetablePlayers(priest, App)).toEqual(onlyP2);
		expect(Game.getTargetablePlayers(guard, App)).toEqual(onlyP2);
	});

	it("3 players cases with 2 protected opponents", function()
	{
		p2.setProtection(true);
		p3.setProtection(true);
		App.addPlayer(p3);

		expect(Game.getTargetablePlayers(princess, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(countess, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(king, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(prince, App)).toEqual(onlyP1);
		expect(Game.getTargetablePlayers(handmaid, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(baron, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(priest, App)).toEqual(noPlayer);
		expect(Game.getTargetablePlayers(guard, App)).toEqual(noPlayer);
	});
});

describe("Game.isCardNeedTarget", function() {

	beforeEach(function() {
		p1 = new Player(1, 'irrelevant');
		p2 = new Player(2, 'irrelevant 2');
		p3 = new Player(3, 'irrelevant 3');
		App.reset();
	});

	it("1 player", function() {
		App.addPlayer(p1);
		expect(Game.isCardNeedTarget(guard, App)).toBeFalsy();
		expect(Game.isCardNeedTarget(priest, App)).toBeFalsy();
		expect(Game.isCardNeedTarget(baron, App)).toBeFalsy();
		expect(Game.isCardNeedTarget(king, App)).toBeFalsy();
		expect(Game.isCardNeedTarget(prince, App)).toBeTruthy();
	});

	it("2 players == 1 target", function() {
		App.addPlayer(p1);
		App.addPlayer(p2);
		expect(Game.isCardNeedTarget(guard, App)).toBeTruthy();
		expect(Game.isCardNeedTarget(priest, App)).toBeTruthy();
		expect(Game.isCardNeedTarget(baron, App)).toBeTruthy();
		expect(Game.isCardNeedTarget(king, App)).toBeTruthy();
		expect(Game.isCardNeedTarget(prince, App)).toBeTruthy();
	});

	it("3 players == 2 targets", function() {
		App.addPlayer(p1);
		App.addPlayer(p2);
		App.addPlayer(p3);
		expect(Game.isCardNeedTarget(guard, App)).toBeTruthy();
		expect(Game.isCardNeedTarget(priest, App)).toBeTruthy();
		expect(Game.isCardNeedTarget(baron, App)).toBeTruthy();
		expect(Game.isCardNeedTarget(king, App)).toBeTruthy();
		expect(Game.isCardNeedTarget(prince, App)).toBeTruthy();
	});

	it("2 players and protection = 0 target ", function() {
		App.addPlayer(p1);
		p2.setProtection(true);
		App.addPlayer(p2);
		expect(Game.isCardNeedTarget(guard, App)).toBeFalsy();
		expect(Game.isCardNeedTarget(priest, App)).toBeFalsy();
		expect(Game.isCardNeedTarget(baron, App)).toBeFalsy();
		expect(Game.isCardNeedTarget(king, App)).toBeFalsy();
		expect(Game.isCardNeedTarget(prince, App)).toBeTruthy();
	});

	it("3 players and 2 protections = 0 target ", function() {
		App.addPlayer(p1);
		p2.setProtection(true);
		App.addPlayer(p2);
		p3.setProtection(true);
		App.addPlayer(p3);
		expect(Game.isCardNeedTarget(guard, App)).toBeFalsy();
		expect(Game.isCardNeedTarget(priest, App)).toBeFalsy();
		expect(Game.isCardNeedTarget(baron, App)).toBeFalsy();
		expect(Game.isCardNeedTarget(king, App)).toBeFalsy();
		expect(Game.isCardNeedTarget(prince, App)).toBeTruthy();
	});

	it("3 players and protection = 1 target ", function() {
		App.addPlayer(p1);
		p2.setProtection(true);
		App.addPlayer(p2);
		App.addPlayer(p3);
		expect(Game.isCardNeedTarget(guard, App)).toBeTruthy();
		expect(Game.isCardNeedTarget(priest, App)).toBeTruthy();
		expect(Game.isCardNeedTarget(baron, App)).toBeTruthy();
		expect(Game.isCardNeedTarget(king, App)).toBeTruthy();
		expect(Game.isCardNeedTarget(prince, App)).toBeTruthy();
	});
});

describe("Game.Guess", function() {
	beforeEach(function() {
		p1 = new Player(1, 'irrelevant');
		p2 = new Player(2, 'irrelevant');
		guessParams = {guess: 8};
		p1.setHand(guard, guard);
		p1.setEventHandlerAndRoom(socketHandlerMock, 'test');
		p2.setEventHandlerAndRoom(socketHandlerMock, 'test');
	});

	it("gotcha I", function() {
		p2.setHand(princess);
		expect(
			p1.attack(Game, guard, p2, guessParams).response
		).toBeTruthy();
	});

	it("gotcha II", function() {
		var validGuess = 8;
		expect(Game.guess(validGuess, princess)).toBeTruthy();
	});

	it("missed I", function() {
		p2.setHand(guard);
		expect(p1.attack(Game, guard, p2, guessParams).response).toBeFalsy();
	});

	it("missed II", function() {
		var validGuess = 8;
		expect(Game.guess(validGuess, guard)).toBeFalsy();
	});

	it("no target", function() {
		expect(p1.attack(Game, guard, null, {guess:0}).response).toBeNull();
	});

	var validGuessCards = [2,3,4,5,6,7,8];
	using(validGuessCards, function(value){
		it("valid value test #" + value, function() {
			expect(Game.guess(value, guard)).toBeFalsy();
		});
	});

	it("invalid", function() {
		var wrongGuess  = 1;
		var wrongGuess2 = 'a';
		expect(Game.guess.bind({}, wrongGuess, guard)).toThrow();
		expect(Game.guess.bind({}, wrongGuess2, guard)).toThrow();
	});
});

describe("Game.Peek", function() {
	beforeEach(function() {
		p1 = new Player(2, 'irrelevant');
	});

	it("show hand, OK", function() {
		expect(Game.peek(p1)).toBeTruthy();
	});

	it("fail (protected)", function() {
		p1.setProtection(true);
		expect(Game.peek(p1)).toBeFalsy();
	});
});

describe("Game.Fight", function() {
	var guard    = Cards.get('guard');
	var princess = Cards.get('princess');
	it("player 1 win", function() {
		expect(Game.fight(princess, guard)).toBeTruthy();
	});
	it("player 2 win", function() {
		expect(Game.fight(guard, princess)).toBeFalsy();
	});
	it("equal, draw", function() {
		expect(Game.fight(guard, guard)).toBeNull();
	});
	it("no target", function() {
		expect(Game.fight(guard, null)).toBeNull();
	});
});

describe("Game.Protect", function() {
	beforeEach(function() {
		p1 = new Player(1, 'irrelevant');
	});

	it("set protection ON", function() {
		p1.setProtection(true);
		expect(p1.protection).toBeTruthy();
	});

	it("set protection OFF", function() {
		expect(p1.protection).toBeFalsy();
	});

	it("set protection OFF, at next turn", function() {
		p1.setProtection(true);
		expect(p1.protection).toBeTruthy();
		var deck = Cards.generateDefaultDeck();
		Game.nextTurnForPlayer(p1, deck);
		expect(p1.protection).toBeFalsy();
	});
});

describe("Game.Discard", function() {
	beforeEach(function() {
		p1 = new Player(1, 'irrelevant');
		p2 = new Player(2, 'irrelevant');
		deck = Cards.generateDefaultDeck();;
	});

	it("enemy discard OK", function() {
		p2.setHand(guard);
		expect(Game.discard(p2, deck)).toBeTruthy();
		expect(p2.cardsInHand.length).toEqual(1);
	});

	it("enemy discard FAIL (protected)", function() {
		p2.setHand(princess);
		p2.setProtection(true);
		expect(Game.discard(p2, deck)).toBeFalsy();
		expect(p2.cardsInHand.length).toEqual(1);
	});

	it("enemy discard Princess", function() {
		p2.setHand(princess);
		expect(Game.discard(p2, deck)).toMatch(Cards.constants.LOOSE_THE_Game);
		expect(p2.cardsInHand.length).toEqual(1);
	});
});

describe("Game.Trade", function() {
	beforeEach(function() {
		p1 = new Player(1, 'irrelevant');
		p2 = new Player(2, 'irrelevant');
		p1.setEventHandlerAndRoom(socketHandlerMock, 'test');
		p2.setEventHandlerAndRoom(socketHandlerMock, 'test');
		deck = Cards.generateDefaultDeck();;
	});

	it("trade hands OK", function() {
		p1.setHand(guard);
		p2.setHand(baron);
		expect(Game.trade(p1, p2)).toBeTruthy();
		expect(p1.cardsInHand.length).toEqual(1);
		expect(p2.cardsInHand.length).toEqual(1);
		expect(p1.getTheCard()).toBe(baron);
		expect(p2.getTheCard()).toBe(guard);
	});

	it("trade hands OK II", function() {
		p1.setHand(guard, king);
		p2.setHand(baron);
		p1.attack(Game, king, p2);
		expect(p1.cardsInHand.length).toEqual(1);
		expect(p2.cardsInHand.length).toEqual(1);
		expect(p1.getTheCard()).toBe(baron);
		expect(p2.getTheCard()).toBe(guard);
	});

	it("no target, no trade hands, but it's OK", function() {
		p1.setHand(guard);
		p2.setHand(baron);
		expect(Game.trade(p1, null)).toBeTruthy();
		expect(p1.cardsInHand.length).toEqual(1);
		expect(p2.cardsInHand.length).toEqual(1);
		expect(p1.getTheCard()).toBe(guard);
		expect(p2.getTheCard()).toBe(baron);
	});

	it("trade hands FAIL, protected", function() {
		p1.setHand(guard);
		p2.setHand(baron);
		p2.setProtection(true);
		expect(Game.trade(p1, p2)).toBeFalsy();
		expect(p1.cardsInHand.length).toEqual(1);
		expect(p2.cardsInHand.length).toEqual(1);
		expect(p1.getTheCard()).toBe(guard);
		expect(p2.getTheCard()).toBe(baron);
	});

	it("trade hands FAIL, protected", function() {
		p1.setHand(guard);
		expect(Game.trade(p1, p1)).toBeFalsy();
	});
});

// TODO
describe("Play countess", function() {
	/*
	var validAlternatives = [guard, priest, baron, handmaid, prince];
	using(validAlternatives, function(card){
		it("valid alternatieve " + card.name, function() {
			expect(Game.guess(card, guard)).toBeFalsy();
		});
	});
	*/

	it("ok", function() {
		p1.setHand(countess, guard);
		expect(p1.attack.bind(this, Game, countess)).toBeTruthy();
	});
});


describe("is playable card", function() {
	beforeEach(function() {
		p1   = new Player(1, 'irrelevant');
		p2   = new Player(2, 'irrelevant');
		game = Game;
		er   = game.errors;
	});
	it("you must have 2 cards in your hand to play", function() {
		p1.setHand(guard);
		expect(game.getErrorsIfNotPlayableCard(guard, p1, p2)).toMatch(er.MUST_BE_2_Cards);
	});

	it("not in your hand", function() {
		p1.setHand(guard, guard);
		expect(game.getErrorsIfNotPlayableCard(countess, p1, p2)).toMatch(er.CARD_NOT_ISSET);
	});

	it("target is protected", function() {
		p1.setHand(guard, guard);
		p2.setProtection(true);
		expect(game.getErrorsIfNotPlayableCard(guard, p1, p2)).toMatch(er.TARGET_PROTECTED);
	});

	it("baron can't target himself", function() {
		p1.setHand(baron, guard);
		expect(game.getErrorsIfNotPlayableCard(baron, p1, p1)).toMatch(er.BARON_TARGETED_HIMSELF);
	});

	it("can't play king or princess if you have countess", function() {
		p1.setHand(countess, king);
		expect(game.getErrorsIfNotPlayableCard(king, p1, p1)).toMatch(er.MUST_PLAY_COUNTESS);
		p1.setHand(countess, princess);
		expect(game.getErrorsIfNotPlayableCard(princess, p1, p1)).toMatch(er.MUST_PLAY_COUNTESS);
	});

	it("can't play princess", function() {
		p1.setHand(guard, princess);
		expect(game.getErrorsIfNotPlayableCard(princess, p1, p1)).toMatch(er.PRINCESS_CANNOT_BE_PLAYED);
	});

	it("wrong guess number", function() {
		p1.setHand(guard, guard);
		expect(game.getErrorsIfNotPlayableCard(guard, p1, p1, {guess:1})).toMatch(er.WRONG_GUESS_NUMBER);
		expect(game.getErrorsIfNotPlayableCard(guard, p1, p1, {guess:9})).toMatch(er.WRONG_GUESS_NUMBER);
	});

	it("Example OK", function() {
		p1.setHand(guard, baron);
		expect(game.getErrorsIfNotPlayableCard(baron, p1, p2)).toBeFalsy();
		expect(game.isPlayableCard(baron, p1, p2)).toBeTruthy();
	});

	it("Example OK II", function() {
		p1.setHand(princess, priest);
		expect(game.getErrorsIfNotPlayableCard(priest, p1, p2)).toBeFalsy();
		expect(game.isPlayableCard(priest, p1, p2)).toBeTruthy();
	});

	it("Example OK III", function() {
		p1.setHand(handmaid, priest);
		expect(game.getErrorsIfNotPlayableCard(handmaid, p1, p1)).toBeFalsy();
		expect(game.isPlayableCard(handmaid, p1, p1)).toBeTruthy();
	});
});

describe("AppLogic", function() {
	beforeEach(function() {
		p1 = new Player(1, 'irrelevant');
		p2 = new Player(2, 'irrelevant 2');
		App.reset();
		App.addPlayer(p1);
		App.addPlayer(p2);
	});

	it("getOpponent with 2 players", function() {
		expect(App.getAllPlayers().length).toBe(2);
		expect(App.getActivePlayer()).toBe(p1);
		expect(App.getNumberOfPlayers()).toBe(2);
		expect(App.getOpponent()).toBe(p2);
		expect(App.getOpponents()[0]).toBe(p2);
	});

	it("getOpponents with 3+ players", function() {
		p3 = new Player(3, 'irrelevant 3');
		App.addPlayer(p3);
		expect(App.getAllPlayers().length).toBe(3);
		expect(App.getNumberOfPlayers()).toBe(3);
		expect(App.getActivePlayer()).toBe(p1);
		expect(App.getOpponents()[0]).toBe(p2);
	});

	it("getOpponent got error over 2 players", function() {
		p3 = new Player(3, 'irrelevant 3');
		App.addPlayer(p3);
		expect(App.getOpponent.bind({})).toThrow();
	});
});
