
exports.user = function(socketId)
{
	this.id = socketId;
	this.player = null;
	return this;
};
