
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