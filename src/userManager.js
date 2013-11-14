/**
 * User Lister
 * @type {function}
 */
exports.UserManager = function()
{
	/**
	 * The client list
	 */
	var clientList = {};

	/**
	 * @param {User} user
	 */
	this.addUser = function(user)
	{
		clientList[user.id] = user;
	};

	/**
	 * @param {User} user
	 */
	this.removeUser = function(user)
	{
		delete clientList[user.id];
	};

	/**
	 * @param {string} userId
	 * @returns {User|null}
	 */
	this.getUser = function(userId)
	{
		return clientList[userId];
	};

	/**
	 * Get client List
	 */
	this.getList = function()
	{
		return clientList;
	};

	/**
	 * @returns {integer}
	 */
	this.count = function()
	{
		var count = 0, key,
			list = this.getList();
		for (key in list) {
			if (list.hasOwnProperty(key)) {
				++count;
			}
		}
		return count;
	};

	return this;
};
