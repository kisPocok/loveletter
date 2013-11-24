var UserManager = require('../src/userManager').UserManager,
	User = require('../src/user').User;

describe("Room Manager", function()
{
	var userName, anotherUserName, userManager, user, anotherUser;

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
		expect(userManager.getList()).toEqual({});
		expect(userManager.count()).toBe(0);
	});

	it("create a single user", function()
	{
		var fakeList = {};
		fakeList[userName] = user;

		userManager.addUser(user);
		expect(userManager.getList()).toEqual(fakeList);
		expect(userManager.getUser(userName)).toBe(user);
		expect(userManager.count()).toBe(1);
	});

	it("create then remove user", function()
	{
		userManager.addUser(user);
		userManager.removeUser(user);
		expect(userManager.getList()).toEqual({});
		expect(userManager.count()).toBe(0);
	});
});
