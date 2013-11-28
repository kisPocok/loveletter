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
		// TODO part II.
		// expect: szobák száma, szoba neve, roomManager eléri-e
	});

	it("create two rooms", function()
	{
		// TODO part II.
		// expect: szobák száma, szobák neve, elérhetőek-e?
	});

	it("create a single room, then create it again without force param", function()
	{
		// TODO part II.
		// tégy be egy user-t a szobába, nézd meg benne van-e
	});

	it("create a single room, then force to re-create it", function()
	{
		// TODO part II.
		// tégy be egy user-t a szobába, hozd létre "forszolva ugyanazt a szobát, nézd meg benne van-e
	});
});
