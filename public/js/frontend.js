
var user = {};
var game = null;
var socket = io.connect('http://127.0.0.1:3000');

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