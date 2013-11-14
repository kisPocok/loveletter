var SocketHelper = require('../src/SocketHelper').SocketHelper;

describe("Socket Helper", function()
{
	beforeEach(function()
	{
		userName = 'default-user';
		roomName = 'default-room';
		anotherRoomName = 'another-room';
		eventName = 'default-event';
		eventParams = {'default': 'param'};

		toMock = jasmine.createSpyObj('to', ['emit']);
		broadcastMock = jasmine.createSpyObj('broadcast', ['to']);
		socketMock = jasmine.createSpyObj('socket', ['emit', 'join', 'leave']);

		socketHelper = new SocketHelper(socketMock);
	});

	it("emitToCurrentUser with params", function()
	{
		socketHelper.emitToCurrentUser(eventName, eventParams);
		expect(socketMock.emit).toHaveBeenCalledWith(eventName, eventParams);
	});

	it("emitToCurrentUser without params", function()
	{
		socketHelper.emitToCurrentUser(eventName);
		expect(socketMock.emit).toHaveBeenCalledWith(eventName, null);
	});

	it("emitToUser", function()
	{
		var nestedSpy = jasmine.createSpyObj('socketMock', ['emit']);
		var ioMock = {
			sockets: {
				socket: jasmine.createSpy('socket').andReturn(nestedSpy)
			}
		};

		var socketHelper = new SocketHelper(socketMock);
		socketHelper.io = ioMock;

		socketHelper.emitToUser(userName, eventName, eventParams);
		expect(ioMock.sockets.socket).toHaveBeenCalledWith(userName);
		expect(ioMock.sockets.socket(nestedSpy).emit).toHaveBeenCalledWith(eventName, eventParams);

		socketHelper.emitToUser(userName, eventName);
		expect(ioMock.sockets.socket).toHaveBeenCalledWith(userName);
		expect(ioMock.sockets.socket(nestedSpy).emit).toHaveBeenCalledWith(eventName, null);
	});

	it("emitToRoomExceptCurrent", function()
	{
		var nestedSpy = jasmine.createSpyObj('socketMock', ['emit']);
		var updatedSocketMock = {
			broadcast: {
				to: jasmine.createSpy('to').andReturn(nestedSpy)
			}
		};

		var socketHelper = new SocketHelper(updatedSocketMock);
		socketHelper.emitToRoomExceptCurrent(roomName, eventName, eventParams);
		expect(updatedSocketMock.broadcast.to).toHaveBeenCalledWith(roomName);
		expect(updatedSocketMock.broadcast.to(nestedSpy).emit).toHaveBeenCalledWith(eventName, eventParams);

		socketHelper.emitToRoomExceptCurrent(roomName, eventName);
		expect(updatedSocketMock.broadcast.to).toHaveBeenCalledWith(roomName);
		expect(updatedSocketMock.broadcast.to(nestedSpy).emit).toHaveBeenCalledWith(eventName, null);
	});

	it("emitToRoom", function()
	{
		var nestedSpy = jasmine.createSpyObj('socketMock', ['emit']);
		var ioMock = {
			sockets: {
				'in': jasmine.createSpy('socket').andReturn(nestedSpy)
			}
		};

		var socketHelper = new SocketHelper(socketMock);
		socketHelper.io = ioMock;

		socketHelper.emitToRoom(roomName, eventName, eventParams);
		expect(ioMock.sockets['in']).toHaveBeenCalledWith(roomName);
		expect(ioMock.sockets['in'](nestedSpy).emit).toHaveBeenCalledWith(eventName, eventParams);

		socketHelper.emitToRoom(roomName, eventName);
		expect(ioMock.sockets['in']).toHaveBeenCalledWith(roomName);
		expect(ioMock.sockets['in'](nestedSpy).emit).toHaveBeenCalledWith(eventName, null);
	});

	it("emitToEverybodyExceptCurrent", function()
	{
		var updatedSocketMock = {
			broadcast: jasmine.createSpyObj('socketMock', ['emit'])
		};

		var socketHelper = new SocketHelper(updatedSocketMock);
		socketHelper.emitToEverybodyExceptCurrent(eventName, eventParams);
		expect(updatedSocketMock.broadcast.emit).toHaveBeenCalledWith(eventName, eventParams);

		socketHelper.emitToEverybodyExceptCurrent(eventName);
		expect(updatedSocketMock.broadcast.emit).toHaveBeenCalledWith(eventName, null);
	});

	it("emitToEverybody", function()
	{
		var ioMock = {
			sockets: jasmine.createSpyObj('socketMock', ['emit'])
		};

		var socketHelper = new SocketHelper(socketMock);
		socketHelper.io = ioMock;

		socketHelper.emitToEverybody(eventName, eventParams);
		expect(ioMock.sockets.emit).toHaveBeenCalledWith(eventName, eventParams);

		socketHelper.emitToEverybody(eventName);
		expect(ioMock.sockets.emit).toHaveBeenCalledWith(eventName, null);
	});

	it("joinRoomCurrentUser", function()
	{
		socketHelper.joinRoomCurrentUser(roomName);
		expect(socketMock.join).toHaveBeenCalledWith(roomName);
	});

	it("leaveRoomCurrentUser", function()
	{
		socketHelper.leaveRoomCurrentUser(roomName);
		expect(socketMock.leave).toHaveBeenCalledWith(roomName);
	});

	it("changeRoomCurrentUser", function()
	{
		socketHelper.joinRoomCurrentUser(roomName);
		socketHelper.leaveRoomCurrentUser(anotherRoomName);
		expect(socketMock.join).toHaveBeenCalledWith(roomName);
		expect(socketMock.leave).toHaveBeenCalledWith(anotherRoomName);
	});
});
