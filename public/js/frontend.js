
var user = {};
var game = null;
var socket = io.connect('http://127.0.0.1:3000');

var GamePlay = new (function GamePlay()
{
	this.currentPlayer = null;
	this.activePlayerName = null;
	this.players = [];
	this.opponents = [];
	this.deckCount = 0;

	/**
	 * @param {object} data
	 */
	this.update = function(data)
	{
		this.currentPlayer = data.yourself;
		this.activePlayerName = data.activePlayer;
		this.players = data.players;
		this.opponents = data.players.filter(function(player) {
			return player.name !== data.yourself.name;
		});
		this.deckCount = data.deckCount;
	};

	/**
	 * @returns {int}
	 */
	this.prompt = function()
	{
		var guess;
		if (guess = prompt('Melyik kártyát választod? (2-től 8-ig írj egy számot!)')) {
			return parseInt(guess);
		}
		return 0;
	}

	/**
	 * @param {int} playersCount
	 */
	this.renderGameQueue = function(playersCount)
	{
		var gameQueue = $("#gamequeue"),
			startButton = $('#start');

		if (playersCount > 1) {
			startButton.show();
		} else {
			startButton.hide();
		}

		gameQueue.text(playersCount + ' player(s) in the queue.');
	};

	this.renderGamePlay = function()
	{
		var gamePlay = $("#gameplay");

		var currentPlayerHtml = createPlayerGameplay(
			this.currentPlayer.name, this.currentPlayer.cardsInHand
		);

		var i, opponentsHtml = '<div id="opponents">';
		for (i in this.opponents) {
			var opp = this.opponents[i];
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
		var i, card, cardsHtml = '';
		for (i in cards) {
			card = cards[i];
			cardsHtml += '<a class="card card' + card.id + '" data-cardid="' + card.id + '">';
			cardsHtml += card.name;
			cardsHtml += '(' + card.id + ')</a>';
			cardsHtml += '<br />';
		}
		return '<!-- player\'s spot -->' +
			'<div id="yourself">' +
				'<h2>Te: ' + name + ' </h2>' +
				'<div class="cards">' +
					cardsHtml +
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
		var cardsHtml = '';
		for (var i=0; i<cardCount; i++) {
			cardsHtml += '<div class="card unknown">?</div>';
		}
		return '<!-- opponent\'s spot -->' +
			'<div class="opponent">' +
				'<h2>Opponent: ' + name + ' </h2>' +
				'<div class="cards">' +
					cardsHtml +
				'</div>' +
			'</div>';
	};

});

socket.on('handshake', function(response) {
	//console.log('Handshake', response.userId);
	user.id = response.userId;
	$('#enter').click(); // TODO autoconnect to room
});

socket.on('room.playerJoined', function(response) {
	GamePlay.renderGameQueue(response.playerCount);
});

socket.on('room.playerLeft', function(response) {
	GamePlay.renderGameQueue(response.playerCount);
});

socket.on('player.draw', function() {
	socket.emit('game.getUpdates', {userId: user.id});
});

socket.on('game.start', function() {
	socket.emit('game.getUpdates', {userId: user.id});
});

socket.on('game.attack', function() {
	socket.emit('game.getUpdates', {userId: user.id});
});

socket.on('game.update', function(response) {
	console.log('Update the gameplay', response);
	GamePlay.update(response);
	GamePlay.renderGamePlay();
});

socket.on('card.prompt', function(params) {
	params.guess = GamePlay.prompt();
	socket.emit('game.playCard', params);
});

socket.on('card.target', function(params) {
	params.target = GamePlay.opponents[0].name; // TODO ide user választó kell. Figyelj majd arra, hogy név alapján megy az azonosítás!
	socket.emit('game.playCard', params);
});






var unimplementedEvents = [
	'game.playCountress',
	'game.trade',
	'game.discard.win',
	'game.discard',
	'game.protect',
	'game.fight.win',
	'game.fight.loose',
	'game.fight.equal',
	'game.peek',
	'game.guess.success',
	'game.guess.failed',
	'game.loose',
	'game.nextPlayer',
	'game.reset',
	'game.end',
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
