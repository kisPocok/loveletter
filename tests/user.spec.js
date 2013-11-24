var User = require('../src/user').User,
	Room = require('../src/room').room;

describe("User", function()
{
	var roomName, socketId, user, room;

	beforeEach(function()
	{
		roomName = 'default-room';
		socketId = 'default-socket-id';
		user = new User(socketId);
		room = new Room(roomName);
	});

	it("default values", function()
	{
		expect(user.id).toBe(socketId);
		expect(user.player).toBeNull();
		expect(user.room).toBeNull();
	});

	it("update room with room class", function()
	{
		user.updateWithRoom(room);
		expect(user.room).toEqual(room.name);
	});

	it("update room with string", function()
	{
		user.updateWithRoom(roomName);
		expect(user.room).toEqual(roomName);
	});
});
