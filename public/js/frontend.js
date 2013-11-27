
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
	 * @returns {int}
	 */
	this.prompt = function()
	{
		var guess;
		if (guess = prompt('Melyik kártyát választod? (2-től 8-ig írj egy számot!)')) {
			return parseInt(guess);
		}
		return 0;
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
	}

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
				' class="btn btn-lg btn-primary card card' + card.id + '" ' +
				' data-cardid="' + card.id + '"' +
				//' data-toggle="popover"' +
				//' role="button"' +
				//' data-original-title="Select your target"' +
				//' data-content="Player 1 || Player 2"' +
				'>' + card.name + ' (' + card.id + ')' +
				'</a> ';
		}
		return '<!-- player\'s spot -->' +
			'<div id="yourself">' +
				'<h2>Te: ' + name + ' </h2>' +
				'<div class="cards">' +
					cardsHtml +
				'</div>' +
			'</div>';
	};

	var createTargetSelector = function(yourselfIsEnabled, protectedPlayers)
	{
		var html = '<div class="popover bottom">' +
			'<div class="arrow"></div>' +
			'<h3 class="popover-title">Select target player</h3>' +
			'<div class="popover-content">' +
				'<p><img src="#" alt="Yourself" class="img-circle"></p>' +
			'</div>' +
		'</div>';

		return html;
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

socket.on('handshake', handshake);
socket.on('room.playerJoined', renderQueue);
socket.on('room.playerLeft', renderQueue);
socket.on('player.draw', getUpdates('draw'));
socket.on('player.loose', looseTheGame);
socket.on('game.start', getUpdates('start'));
socket.on('game.attack', getUpdates('attack'));
socket.on('game.update', update);
socket.on('game.reset', gameReset);
socket.on('game.playerLoose', getUpdates('playerLoose'));
socket.on('game.end', gameEnded);
socket.on('card.prompt', cardGuess);
socket.on('card.target', cardTarget);
socket.on('game.guess.success', toastGuess);
socket.on('game.guess.failed', toastGuess);

function handshake(response) {
	//console.log('Handshake', response.userId);
	user.id = response.userId;
	$('#enter').click(); // TODO autoconnect to room
}
function renderQueue(response) {
	GamePlay.renderGameQueue(response.playerCount);
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
	if (user.id == params.winnerPlayer.id) {
		console.warn('YOU WON THE GAME :)');
	}
}
function toastGuess(params)
{
	var text = '<strong>' + params.player.name + '</strong> is playing <strong>' + params.response.card.name + '</strong>.' +
		'The target is <strong>' + params.targetPlayer.name + '</strong>. ' +
		'His or her guess is <strong>' + params.response.params.guessCard.name + '</strong>. ' +
		'He is <strong>' + (params.response.response ? 'right' : 'wrong') + '</strong>.';
	var html = _alertHtml(text);
	$('#alert').html(html).children('a').alert();
}
function _alertHtml(content)
{
	return '<div class="alert alert-warning fade in">' +
			'<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' + content +
		'</div>';
}





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
