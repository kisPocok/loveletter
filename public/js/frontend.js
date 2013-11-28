
var user = {};
var lastState = null;
var socket = io.connect('http://127.0.0.1:3000');

var GamePlay = new (function GamePlay()
{
	this.currentPlayer = null;
	this.activePlayerName = null;
	this.players = [];
	this.opponents = [];
	this.deckCount = 0;

	var gamePlay = $("#gameplay");

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

	this.reset = function()
	{
		gamePlay.html('');
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
		return '<!-- opponent\'s spot -->' +
			'<div class="opponent">' +
				'<h2 title="' + name + '">Your opponent have ' + cardCount + ' card(s) in his hand.</h2>' +
			'</div>';
	};
});

socket.on('handshake', handshake);
socket.on('room.playerJoined', renderQueue);
socket.on('room.playerLeft', renderQueue);
socket.on('player.draw', getUpdates('draw'));
socket.on('player.loose', looseTheGame);
socket.on('game.start', startTheGame);
socket.on('game.attack', getUpdates('attack'));
socket.on('game.update', update);
socket.on('game.reset', gameReset);
socket.on('game.playerLoose', getUpdates('playerLoose'));
socket.on('game.end', gameEnded);
socket.on('card.prompt', cardGuess);
socket.on('card.target', cardTarget);
socket.on('game.guess.success', toastGuess);
socket.on('game.guess.failed', toastGuess);
socket.on('game.fight.lost', toastFight);

function handshake(response) {
	console.log('Handshake', response.userId);
	user.id = response.userId;
	$('#enter').click(); // TODO autoconnect to room
}
function renderQueue(response) {
	GamePlay.renderGameQueue(response.playerCount);
}
function startTheGame() {
	$('#gamestart').hide();
	getUpdates('start')();
}
function getUpdates(plan) {
	return function() {
		console.log('Update because', plan);
		socket.emit('game.getUpdates', {userId: user.id});
	}
}
function update(response) {
	if (JSON.stringify(response) == JSON.stringify(lastState)) {
		return;
	}
	lastState = response;
	GamePlay.update(response);
	GamePlay.renderGamePlay();
}
function cardGuess(params) {
	var container = $('#guess');
	container.html(params.html);
	container.find('.btn').click(function(event) {
		params.guess = $(event.target).data('cardid');
		delete params.html;
		socket.emit('game.playCard', params);
		container.children('div').modal('hide');
	});
	container.children('div').modal('show');
}
function cardTarget(params) {
	var container = $('#target');
	container.html(params.html);
	container.find('.btn').click(function(event) {
		params.target = $(event.target).data('userid');
		delete params.html;
		socket.emit('game.playCard', params);
		container.children('div').modal('hide');
	});
	container.children('div').modal('show');
}
function gameReset() {
	GamePlay.reset();
}
function looseTheGame() {
	console.warn('YOU LOST :(');
}
function gameEnded(params) {
	console.log('gameEnded  ', params);
	var isWinner = user.id == params.player.id;
	var html = $(isWinner ? params.win : params.loose);
	$('#history').append(html).children('a').alert();
	$('#gamestart').show();
}
function toastFight(params)
{
	console.log('TODO', params);
}
function toastGuess(params)
{
	console.log('toastGuess', params);
	$('#history').append($(params.history)).children('a').alert();
}




// TODO
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
	'game.nextPlayer',
	'game.playerLost',
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
