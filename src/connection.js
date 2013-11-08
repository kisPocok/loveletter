var clients = require('./clients').clients;
var utils = require('./utils').utils;

exports.connection = function(io, serverHelper)
{
	io.sockets.on('connection', function(socket)
	{
		socket.emit('news', { hello: 'world' });
		/*
		try {
			var userId = utils.getCookie('userId', socket.handshake.headers['cookie']);
			if (clients[userId]) {
				console.log('visszatérő játékos:', userId);
			}
		} catch(e) {
			// do nothing
			console.log('HIBA!', e);
		}
		var activePlayer = {
			userId: userId,
			socketId: socket.id
		};
		clients[userId] = activePlayer;
		serverHelper.emitToUser(userId, 'player.greetings', activePlayer);
		*/
	});
};
