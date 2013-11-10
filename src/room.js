/**
 * Room
 * @type {function}
 */
exports.room = function(roomName)
{
	this.name = roomName;
	this.userIdList = [];
	this.game = null;

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
		var index = this.userIdList.indexOf(user.id);
		if (index > -1) {
			this.userIdList.splice(index, 1);
		}
	};

	/**
	 * Get user IDs list
	 * @returns {Array}
	 */
	this.getUserIdList = function()
	{
		return this.userIdList;
	};

	/**
	 * @param {object} gameObject
	 */
	this.setGame = function(gameObject)
	{
		this.game = gameObject;
	};

	/**
	 * @returns {null|object|*}
	 */
	this.getGame = function()
	{
		return this.game;
	};
};
