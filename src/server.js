var utils  = require('./utils').utils;
var game   = require('./game').game;
var cards  = require('./cards').cards;
var player = require('./player').player;
var events = require('./events').events;

var Server = (function()
{
	var instance;
	var self = {};

	self.router = {};
	self.router.home = function(request, response)
	{
		var userId = request.cookies.userId;
		if (!userId) {
			// új játékos
			// TODO request.cookies.'connect.sid' -t kéne használni, az "egyedibb"!
			userId = Math.floor(Math.random() * 100000);
			console.log('Új játékos:', userId);
		}
		response.cookie('userId', userId, {maxAge: 900000, httpOnly: true});
		response.sendfile(__dirname + '/../index.html');
	};

	function init()
	{
		// do something useful here
		return self;
	}

	return {
		// Get the Singleton instance if one exists
		// or create one if it doesn't
		getInstance: function()
		{
			if (!instance) {
				instance = init();
			}
			return instance;
		}

	};
}());

// Node export
exports.server = Server.getInstance();