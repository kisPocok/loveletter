/**
 * Server Helper Class
 * @type {object}
 */
exports.srvHelper = function(Clients, IO)
{
	var self = {};

	/**
	 * @param userId
	 * @param eventName
	 * @param eventParams
	 * @returns {*}
	 */
	self.emitToUser = function(userId, eventName, eventParams)
	{
		if (Clients[userId]) {
			var socketId = Clients[userId].getParam('sid');
			return self.emitToSocket(socketId, eventName, eventParams);
		}
		return false;
	};

	/**
	 * @param socketId
	 * @param eventName
	 * @param eventParams
	 * @returns {boolean}
	 */
	self.emitToSocket = function(socketId, eventName, eventParams)
	{
		if (socketId) {
			IO.sockets.socket(socketId).emit(eventName, eventParams ? eventParams : null);
			return true;
		}
		return false;
	};

	return self;
};