/**
 * Room
 */
exports.SocketHelper = function(socketConnection)
{
	this.socketConnection = socketConnection;
	this.io = GLOBAL.io;

	/**
	 * @param {string} eventName
	 * @param {*} eventParams
	 */
	this.emitToCurrentUser = function(eventName, eventParams)
	{
		var params = eventParams || null;
		this.socketConnection.emit(eventName, params);
	};

	/**
	 * @param {User|string} user
	 * @param {string} eventName
	 * @param {*} eventParams
	 */
	this.emitToUser = function(user, eventName, eventParams)
	{
		var userId = user.id || user;
		var params = eventParams || null;
		this.io.sockets.socket(userId).emit(eventName, params);
	};

	/**
	 * @param {Room|string} room
	 * @param {string} eventName
	 * @param {*} eventParams
	 */
	this.emitToRoomExceptCurrent = function(room, eventName, eventParams)
	{
		var roomName = room.name || room;
		var params = eventParams || null;
		this.socketConnection.broadcast.to(roomName).emit(eventName, params);
	};

	/**
	 * @param {Room|string} room
	 * @param {string} eventName
	 * @param {*} eventParams
	 */
	this.emitToRoom = function(room, eventName, eventParams)
	{
		var roomName = room.name || room;
		var params = eventParams || null;
		this.io.sockets.in(roomName).emit(eventName, params);
		//this.socketConnection.broadcast.to(roomName).emit(eventName, params);
		//this.emitToCurrentUser(eventName, params);
	};

	/**
	 * @param {string} eventName
	 * @param {*} eventParams
	 */
	this.emitToEverybodyExceptCurrent = function(eventName, eventParams)
	{
		var params = eventParams || null;
		this.socketConnection.broadcast.emit(eventName, params);
	};

	/**
	 * @param {string} eventName
	 * @param {*} eventParams
	 */
	this.emitToEverybody = function(eventName, eventParams)
	{
		var params = eventParams || null;
		this.io.sockets.emit(eventName, params);
	};

	/**
	 * @param {Room|string} room
	 */
	this.joinRoomCurrentUser = function(room)
	{
		this.socketConnection.join(room.name||room);
	};

	/**
	 * @param {Room|string} room
	 */
	this.leaveRoomCurrentUser = function(room)
	{
		this.socketConnection.leave(room.name||room);
	};

	/**
	 *
	 * @param {Room|string} oldRoom
	 * @param {Room|string} newRoom
	 */
	this.changeRoomCurrentUser = function(oldRoom, newRoom)
	{
		this.leaveRoomCurrentUser(oldRoom);
		this.joinRoomCurrentUser(newRoom);
	};
};