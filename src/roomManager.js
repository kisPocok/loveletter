var Room = require('./room').room;

exports.roomManager = {

	/**
	 * Room list
	 */
	rooms: {},

	/**
	 * @param {string} roomName
	 * @param {boolean} forceCreate
	 * @returns {Room}
	 */
	createRoom: function(roomName, forceCreate)
	{
		if (this.isAvailableRoom(roomName) && !forceCreate) {
			return this.rooms[roomName];
		}
		return this.rooms[roomName] = new Room(roomName);
	},

	/**
	 * @returns {boolean}
	 */
	isAvailableRoom: function(roomName)
	{
		return !!this.rooms[roomName];
	},

	/**
	 * @param {string} roomName
	 * @returns {Room}
	 */
	getRoom: function(roomName)
	{
		if (!this.rooms[roomName]) {
			throw "Missing room: " + roomName;
		}
		return this.rooms[roomName];
	},

	/**
	 * @returns {Array}
	 */
	getRoomList: function()
	{
		var r, list = [];
		for (r in this.rooms) {
			list.push(r);
		}
		return list;
	}
};