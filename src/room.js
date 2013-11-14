/**
 * Room
 * @type {function}
 */
exports.room = function(roomName)
{
	var userIdList = [];
	var game = null;

	this.name = roomName;

	/**
	 * @param {User} User
	 * @returns {boolean}
	 */
	this.addUser = function(User)
	{
		if (!this.isUserInRoom(User) && User.id) {
			userIdList.push(User.id);
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
		return userIdList.indexOf(user.id) >= 0;
	};

	/**
	 * @param {User} user
	 */
	this.removeUser = function(user)
	{
		var index = userIdList.indexOf(user.id);
		if (index > -1) {
			userIdList.splice(index, 1);
		}
	};

	/**
	 * Get user IDs list
	 * @returns {Array}
	 */
	this.getUserIdList = function()
	{
		return userIdList;
	};

	/**
	 * @param {object} gameObject
	 */
	this.setGame = function(gameObject)
	{
		game = gameObject;
	};

	/**
	 * @returns {null|object|*}
	 */
	this.getGame = function()
	{
		return game;
	};
};
