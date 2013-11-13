var Room = require('./room').room;

/**
 * Room Manager
 * @type {Function}
 */
exports.RoomManager = function()
{
	/**
	 * Room list
	 */
	this.rooms = {};

	/**
	 * @param {string} roomName
	 * @param {boolean} forceCreate
	 * @returns {Room}
	 */
	this.createRoom = function(roomName, forceCreate)
	{
		if (this.isAvailableRoom(roomName) && !forceCreate) {
			return this.rooms[roomName];
		}
		return this.rooms[roomName] = new Room(roomName);
	};

	/**
	 * @returns {boolean}
	 */
	this.isAvailableRoom = function(roomName)
	{
		return !!this.rooms[roomName];
	};

	/**
	 * @param {string} roomName
	 * @returns {Room}
	 */
	this.getRoom = function(roomName)
	{
		if (!this.rooms[roomName]) {
			throw "Missing room: " + roomName;
		}
		return this.rooms[roomName];
	};

	/**
	 * @returns {Array}
	 */
	this.getRoomList = function()
	{
		var r, list = [];
		for (r in this.rooms) {
			list.push(r);
		}
		return list;
	};

	return this;
};
