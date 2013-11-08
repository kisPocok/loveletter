/**
 * User model
 * @type {function}
 * @param {string} socketId
 */
exports.User = function(socketId)
{
	this.id = socketId;
	this.player = null;
	this.room = null;

	/**
	 * @param {Room|string} room
	 */
	this.updateWithRoom = function(room)
	{
		this.room = room.name||room;
	};

	return this;
};
