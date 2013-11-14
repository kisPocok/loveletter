var UserManager = require('../src/userManager').UserManager,
	User = require('../src/user').User;

var userName, anotherUserName, userManager, user, anotherUser;

describe("Room Manager", function()
{
	beforeEach(function()
	{
		userName = 'default-socketId';
		anotherUserName = 'another-socketId';
		userManager = new UserManager();
		user = new User(userName);
		anotherUser = new User(anotherUserName);
	});

	it("default user list", function()
	{
		expect({}).toEqual(userManager.getList());
		expect(0).toBe(userManager.count());
	});

	it("create a single user", function()
	{
		var fakeList = {};
		fakeList[userName] = user;

		userManager.addUser(user);
		expect(fakeList).toEqual(userManager.getList());
		expect(user).toBe(userManager.getUser(userName));
		expect(1).toBe(userManager.count());
	});

	it("create then remove user", function()
	{
		userManager.addUser(user);
		userManager.removeUser(user);
		expect({}).toEqual(userManager.getList());
		expect(0).toBe(userManager.count());
	});
});
