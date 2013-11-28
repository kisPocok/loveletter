var jade = require('jade');

exports.Screen = function()
{
	/**
	 * @param {Array} targetablePlayers
	 * @returns {String}
	 * @private
	 */
	this.playerSelector = function(targetablePlayers)
	{
		var params = {
			'players': targetablePlayers
		};
		return jade.renderFile('views/userSelect.jade', params);
	};

	/**
	 * @param LoveLetter
	 * @returns {String}
	 * @private
	 */
	this.guess = function(LoveLetter)
	{
		var params = {
			'cards': LoveLetter.getCards().list
		};
		return jade.renderFile('views/guess.jade', params);
	};

	return this;
};
