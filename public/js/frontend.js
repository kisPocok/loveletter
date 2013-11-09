
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
			return player.name !== data.currentPlayer;
		});
		this.deckCount = data.deckCount;
		console.log('OPPP', this.opponents);
	};

	this.render = function()
	{
		var gp = $("#gameplay");

		var currentPlayerHtml = createPlayerGameplay(
			this.currentPlayer.name, this.currentPlayer.cardsInHand
		);

		var opponentsHtml = '<div id="opponents">';
		for (i in this.opponents) {
			var opp = this.opponents[i];
			opponentsHtml += createOpponentGameplay(opp.name, opp.cardCount);
		}
		opponentsHtml += '</div>';

		gp.html(currentPlayerHtml + opponentsHtml);
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
			cardsHtml += '<div class="card card' + card.id + '">' + card.name + '(' + card.id + ')</div>';
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
	console.log('Handshake', response.userId);
	user.id = response.userId;
});

socket.on('room.playerJoined', function(response) {
	console.log('players:', response);
	if (response.playerCount > 1) {
		$('#start').show();
	}
});

socket.on('room.playerLeft', function(response) {
	console.log('remaining players:', response);
	if (response.playerCount < 2) {
		$('#start').hide();
	}
});

socket.on('player.draw', function() {
	console.log('A player drawed a card.');
	socket.emit('game.getUpdates', {userId: user.id});
});

socket.on('game.update', function(response) {
	console.log('Update the gameplay', response);
	GamePlay.update(response);
	GamePlay.render();
});




var unimplementedEvents = [
	'game.start',
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
	'game.attack',
	'game.loose',
];
$(unimplementedEvents).each(function(i, eventName) {
	socket.on(eventName, function(response) {
		console.log('Missing implementation: "' + eventName + '"', response);
	});
});


socket.on('game.getGame', function(data) {
	game = data;
	console.log('game:', game);
});

$(function() {
	$('#enter').on('click', function() {
		var roomName = $('#room').val();
		var params = {
			user: user,
			room: roomName
		};
		console.log('client.room.join', params);
		socket.emit('room.join', params);
	});
	$('#start').on('click', function() {
		socket.emit('game.start');
	});
});


















function getGame()
{
	socket.emit('game.getGame', user.id);
}
function startGame()
{
	socket.emit('game.start', user.id);
}
function getPlayers()
{
	socket.emit('game.getPlayers', user.id);
}
function getDeck()
{
	socket.emit('game.getDeck', user.id);
}
function getPlayerCards()
{
	socket.emit('game.getCards', user.id);
}