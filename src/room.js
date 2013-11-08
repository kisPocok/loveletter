/**
 * Room
 * @type {function}
 */
exports.room = function(roomName)
{
	this.name = roomName;
	this.userIdList = [];

	/**
	 * @param {User} user
	 * @returns {boolean}
	 */
	this.addUser = function(user)
	{
		if (!this.isUserInRoom(user)) {
			this.userIdList.push(user.id);
			return true;
		}
		return false;
	};

	/**
	 * @param {User} user
	 * @returns {boolean}
	 */
	this.isUserInRoom = function(user)
	{
		return this.userIdList.indexOf(user.id) >= 0;
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