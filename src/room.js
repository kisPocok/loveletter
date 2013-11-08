/**
 * Room
 */
exports.room = function(roomName)
{
	this.name = roomName;
	this.userIdList = [];

	/**
	 * @param {User} user
	 */
	this.addUser = function(user)
	{
		this.userIdList.push(user.id);
	};

	/**
	 * @param {User} user
	 */
	this.removeUser = function(user)
	{
		console.log('Not implemented yet');
	};

	/**
	 * Get user IDs list
	 * @returns {Array}
	 */
	this.getUserIdList = function()
	{
		return this.userIdList;
	};
};