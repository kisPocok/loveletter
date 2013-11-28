
var user = {};
var socket = io.connect('http://127.0.0.1:3000');
var Game = new (function LoveLetter()
{
	this.currentPlayer = null;
	this.players = [];
	this.opponents = [];
	this.deckCount = 0;
	this.lastState = 0;

	var self = this;
	var gamePlay = $("#gameplay");

	/**
	 * @param {object} response
	 */
	self.handshake = function(response)
	{
		/**
		 * TODO part I.
		 * - a visszakapott userId-t, mentsd el értelemszerűen
		 * - konzolra írjuk ki az értékét, későbbi debug céljából
		 */

		//$('#enter').click();
	};

	self.startTheGame = function()
	{
		$('#gamestart').hide();
		getUpdates('start')();
	};

	self.reset = function()
	{
		gamePlay.html('');
	};

	/**
	 * @param params
	 */
	self.endTheGame = function(params)
	{
		/**
		 * TODO part III.
		 * - állapítsd meg, hogy az aktuális player nyert-e vagy vesztett.
		 * - a megfelelő template-t #history -ba szúrd be
		 * - használd az anchor element a bootstrap .alert(); funkciojat
		 */

		$('#gamestart').show();
	}

	/**
	 * @param {object} response
	 */
	self.update = function(response)
	{
		if (JSON.stringify(response) == JSON.stringify(self.lastState)) {
			return;
		}
		self.lastState = response;
		self.currentPlayer = response.yourself;
		self.players = response.players;
		self.opponents = response.players.filter(function(player) {
			return player.name !== response.yourself.name;
		});
		self.deckCount = response.deckCount;

		renderGamePlay();
	};

	/**
	 * @param {object} response
	 */
	self.renderGameQueue = function(response)
	{
		var gameQueue = $("#gamequeue"),
			startButton = $('#start');

		if (response.playerCount > 1) {
			startButton.show();
		} else {
			startButton.hide();
		}

		gameQueue.text(response.playerCount + ' player(s) in the queue.');
	};

	/**
	 * @param params
	 */
	self.renderHistory = function(params)
	{
		var htmlObj = $(params.history);
		$('#history').append(htmlObj).children('a').alert();
	};

	/**
	 * @param params
	 */
	self.cardGuess = function(params) {
		var container = $('#guess');
		container.html(params.html);
		container.find('.btn').click(function(event) {
			params.guess = $(event.target).data('cardid');
			delete params.html;
			socket.emit('game.playCard', params);
			container.children('div').modal('hide');
		});
		container.children('div').modal('show');
	};

	/**
	 * @param params
	 */
	self.cardTarget = function(params) {
		var container = $('#target');
		container.html(params.html);
		container.find('.btn').click(function(event) {
			params.target = $(event.target).data('userid');
			delete params.html;
			socket.emit('game.playCard', params);
			container.children('div').modal('hide');
		});
		container.children('div').modal('show');
	};

	var renderGamePlay = function()
	{
		var currentPlayerHtml = createPlayerGameplay(
			self.currentPlayer.name, self.currentPlayer.cardsInHand
		);

		var i, opponentsHtml = '<div id="opponents">';
		for (i in self.opponents) {
			var opp = self.opponents[i];
			opponentsHtml += createOpponentGameplay(opp.name, opp.cardCount);
		}
		opponentsHtml += '</div>';

		gamePlay.html(currentPlayerHtml + opponentsHtml);
		gamePlay.find('#yourself').find('.card').click(function(event)
		{
			var params = {
				cardId: $(event.target).data('cardid'),
				extraParams: {}, // TODO
				userId: user.id,
				targetPlayerId: null // TODO
			};
			socket.emit('game.playCard', params);
		});
	};

	/**
	 * @param {string} name
	 * @param {array} cards
	 * @returns {string}
	 */
	var createPlayerGameplay = function(name, cards)
	{
		var yourTurn = cards.length == 2 ? '(select card to play)' : '';
		var i, card, cardsHtml = '';
		for (i in cards) {
			card = cards[i];
			cardsHtml += '<a href="#" ' +
				' class="btn btn-lg btn-large btn-primary card card' + card.id + '" ' +
				' data-cardid="' + card.id + '"' +
				'>' + card.name + ' (' + card.id + ')' +
				'</a> ';
		}
		return '<!-- player\'s spot -->' +
			'<div id="yourself">' +
				'<h2 title="' + name + '">Cards in your hand:</h2>' +
				'<div class="cards">' +
					cardsHtml + yourTurn +
				'</div>' +
			'</div>';
	};

	/**
	 * @param {string} name
	 * @param {integer} cardCount
	 * @returns {string}
	 */
	var createOpponentGameplay = function(name, cardCount)
	{
		return '<!-- opponent\'s spot -->' +
			'<div class="opponent">' +
				'<h2 title="' + name + '">Your opponent have ' + cardCount + ' card(s) in his hand.</h2>' +
			'</div>';
	};

	return self;
});

socket.on('handshake', Game.handshake);
socket.on('room.playerJoined', Game.renderGameQueue);
socket.on('room.playerLeft', Game.renderGameQueue);
socket.on('player.draw', getUpdates('draw'));
socket.on('game.playerLoose', getUpdates('playerLoose'));
socket.on('game.start', Game.startTheGame);
socket.on('game.attack', getUpdates('attack'));
socket.on('game.update', Game.update);
socket.on('game.reset', Game.reset);
socket.on('game.end', Game.endTheGame);
socket.on('game.guess.success', Game.renderHistory);
socket.on('game.guess.failed', Game.renderHistory);
socket.on('game.fight.win', Game.renderHistory);
socket.on('game.fight.loose', Game.renderHistory);
socket.on('card.prompt', Game.cardGuess);
socket.on('card.target', Game.cardTarget);

function getUpdates(plan) {
	return function() {
		console.log('Update because', plan);
		socket.emit('game.getUpdates', {userId: user.id});
	}
}

// TODO
var unimplementedEvents = [
	'game.playCountress',
	'game.trade',
	'game.discard.win',
	'game.discard',
	'game.protect',
	'game.fight.equal',
	'game.peek',
	'game.nextPlayer',
	'game.playerLost',
	'player.notActivePlayer',
	'player.loose',
];
$(unimplementedEvents).each(function(i, eventName) {
	socket.on(eventName, function(response) {
		console.log('Missing implementation: "' + eventName + '"', response);
	});
});

$(function() {
	$('#enter').on('click', function() {
		var roomName = $('#room').val();
		var params = {
			user: user,
			room: roomName
		};
		socket.emit('room.join', params);
	});
	$('#start').on('click', function() {
		socket.emit('game.start');
	});
});
