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
		expect(room.isUserInRoom(socketId)).toBeFalsy();
		expect(room.isUserInRoom(user)).toBeTruthy();
		expect(room.getUserIdList().length).toBe(1);
	});

	it("add same, who is already being in the room", function()
	{
		room.addUser(user);
		room.addUser(user);
		expect(room.isUserInRoom(user)).toBeTruthy();
		expect(room.getUserIdList().length).toBe(1);
	});

	it("add two different users", function()
	{
		room.addUser(user);
		room.addUser(anotherUser);
		expect(room.isUserInRoom(user)).toBeTruthy();
		expect(room.isUserInRoom(anotherUser)).toBeTruthy();
		expect(room.getUserIdList().length).toBe(2);
	});

	it("add two different users then remove one", function()
	{
		room.addUser(user);
		room.addUser(anotherUser);
		room.removeUser(user);
		expect(room.isUserInRoom(user)).toBeFalsy();
		expect(room.isUserInRoom(anotherUser)).toBeTruthy();
		expect(room.getUserIdList().length).toBe(1);
	});

	it("add user then remove non existing one from the room", function()
	{
		room.addUser(user);
		room.removeUser(anotherUser);
		expect(room.isUserInRoom(user)).toBeTruthy();
		expect(room.getUserIdList().length).toBe(1);
	});

	it("add wrong user to room", function()
	{
		room.addUser(socketId);
		expect(room.isUserInRoom(user)).toBeFalsy();
		expect(room.getUserIdList().length).toBe(0);
	});

	it("empty room has no user", function()
	{
		expect(room.getUserIdList().length).toBe(0);
	});

	it("get empty Game Object from room", function()
	{
		expect(room.getGame()).toBeNull();
	});

	it("set Game Object to room", function()
	{
		room.setGame(gameObject);
		expect(room.getGame()).toBe(gameObject);
	});
});
