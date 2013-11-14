var Room = require('../src/room').room,
	User = require('../src/user').User;

describe("Room", function()
{
	beforeEach(function()
	{
		roomName = 'default-room-name';
		socketId = 'default-socket-id';
		user = new User(socketId);
		anotherUser = new User(socketId + '2');
		room = new Room(roomName);
		gameObject = {};
	});

	it("room default values", function()
	{
		expect(room.name).toBe(roomName);
		expect(room.userIdList).toBe(undefined);
		expect(room.game).toBe(undefined);
	});

	it("add user to list", function()
	{
		room.addUser(user);
		expect(false).toBe(room.isUserInRoom(socketId));
		expect(true).toBe(room.isUserInRoom(user));
		expect(1).toBe(room.getUserIdList().length);
	});

	it("add same, who is already being in the room", function()
	{
		room.addUser(user);
		room.addUser(user);
		expect(true).toBe(room.isUserInRoom(user));
		expect(1).toBe(room.getUserIdList().length);
	});

	it("add two different users", function()
	{
		room.addUser(user);
		room.addUser(anotherUser);
		expect(true).toBe(room.isUserInRoom(user));
		expect(true).toBe(room.isUserInRoom(anotherUser));
		expect(2).toBe(room.getUserIdList().length);
	});

	it("add two different users then remove one", function()
	{
		room.addUser(user);
		room.addUser(anotherUser);
		room.removeUser(user);
		expect(false).toBe(room.isUserInRoom(user));
		expect(true).toBe(room.isUserInRoom(anotherUser));
		expect(1).toBe(room.getUserIdList().length);
	});

	it("add user then remove non existing one from the room", function()
	{
		room.addUser(user);
		room.removeUser(anotherUser);
		expect(true).toBe(room.isUserInRoom(user));
		expect(1).toBe(room.getUserIdList().length);
	});

	it("add wrong user to room", function()
	{
		room.addUser(socketId);
		expect(false).toBe(room.isUserInRoom(user));
		expect(0).toBe(room.getUserIdList().length);
	});

	it("empty room has no user", function()
	{
		expect(0).toBe(room.getUserIdList().length);
	});

	it("get empty Game Object from room", function()
	{
		expect(null).toBe(room.getGame());
	});

	it("set Game Object to room", function()
	{
		room.setGame(gameObject);
		expect(gameObject).toBe(room.getGame());
	});
});
