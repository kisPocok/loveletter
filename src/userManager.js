/**
 * User Lister
 * @type {function}
 */
exports.UserManager = function()
{
	/**
	 * The client list
	 */
	this.clientList = {};

	/**
	 * @param {User} user
	 */
	this.addUser = function(user)
	{
		this.clientList[user.id] = user;
	};

	/**
	 * @param {User} user
	 */
	this.removeUser = function(user)
	{
		console.log('Not implemented yet');
	};

	/**
	 * @param {string} userId
	 * @returns {User|null}
	 */
	this.getUser = function(userId)
	{
		return this.clientList[userId];
	};

	/**
	 * Get client List
	 */
	this.getList = function()
	{
		return this.clientList;
	};

	/**
	 * @returns {integer}
	 */
	this.count = function()
	{
		return this.getList().length;
	};

	return this;
};
