/**
 * Client Lister
 * @type {object}
 */
exports.clients = {
	/**
	 * The client list
	 */
	clientList: {},

	/**
	 * @param {User} user
	 */
	addUser: function(user)
	{
		this.clientList[user.id] = user;
	},

	/**
	 * @param {User} user
	 */
	removeUser: function(user)
	{
		console.log('Not implemented yet');
	},

	/**
	 * @param {string} userId
	 * @returns {User|null}
	 */
	getUser: function(userId)
	{
		return this.clientList[userId];
	},

	/**
	 * Get client List
	 */
	getList: function()
	{
		return this.clientList;
	},

	/**
	 * @returns {integer}
	 */
	count: function()
	{
		return this.getList().length;
	}
};