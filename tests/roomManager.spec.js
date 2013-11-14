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
		expect(true).toBe(roomManager.isAvailableRoom(roomName));
		expect(room.name).toBe(roomName);
		expect(room).toBe(roomManager.getRoom(roomName));
		expect(1).toBe(roomManager.getRoomList().length);
		expect([roomName]).toEqual(roomManager.getRoomList());
	});

	it("create two rooms", function()
	{
		var room = roomManager.createRoom(roomName);
		var room2 = roomManager.createRoom(anotherRoomName);

		expect(true).toBe(roomManager.isAvailableRoom(roomName));
		expect(true).toBe(roomManager.isAvailableRoom(anotherRoomName));

		expect(room).toBe(roomManager.getRoom(roomName));
		expect(room2).toBe(roomManager.getRoom(anotherRoomName));

		expect(2).toBe(roomManager.getRoomList().length);
		expect([roomName, anotherRoomName]).toEqual(roomManager.getRoomList());
	});

	it("create a single room, then create it again without force param", function()
	{
		var room = roomManager.createRoom(roomName);
		room.addUser(user);
		var room2 = roomManager.createRoom(roomName);
		expect(true).toBe(room2.isUserInRoom(user));
	});

	it("create a single room, then force to re-create it", function()
	{
		var room = roomManager.createRoom(roomName);
		room.addUser(user);
		var room2 = roomManager.createRoom(roomName, true);
		expect(false).toBe(room2.isUserInRoom(user));
	});
});
