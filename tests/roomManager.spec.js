var RoomManager = require('../src/roomManager').RoomManager,
	User = require('../src/user').User;

describe("Room Manager", function()
{
	beforeEach(function()
	{
		roomName = 'default-room';
		anotherRoomName = 'another-default-room';
		roomManager = new RoomManager();
		user = new User('default-socketId');
	});

	it("create a single room", function()
	{
		var room = roomManager.createRoom(roomName);
		expect(roomManager.isAvailableRoom(roomName)).toBeTruthy;
		expect(room.name).toBe(roomName);
		expect(room).toBe(roomManager.getRoom(roomName));
		expect(roomManager.getRoomList().length).toBe(1);
		expect(roomManager.getRoomList()).toEqual([roomName]);
	});

	it("create two rooms", function()
	{
		var room = roomManager.createRoom(roomName);
		var room2 = roomManager.createRoom(anotherRoomName);

		expect(roomManager.isAvailableRoom(roomName)).toBeTruthy();
		expect(roomManager.isAvailableRoom(anotherRoomName)).toBeTruthy();

		expect(roomManager.getRoom(roomName)).toBe(room);
		expect(roomManager.getRoom(anotherRoomName)).toBe(room2);

		expect(roomManager.getRoomList().length).toBe(2);
		expect(roomManager.getRoomList()).toEqual([roomName, anotherRoomName]);
	});

	it("create a single room, then create it again without force param", function()
	{
		var room = roomManager.createRoom(roomName);
		room.addUser(user);
		var room2 = roomManager.createRoom(roomName);
		expect(room2.isUserInRoom(user)).toBeTruthy();
	});

	it("create a single room, then force to re-create it", function()
	{
		var room = roomManager.createRoom(roomName);
		room.addUser(user);
		var room2 = roomManager.createRoom(roomName, true);
		expect(room2.isUserInRoom(user)).toBeFalsy();
	});
});
