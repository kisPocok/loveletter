var jade = require('jade');

exports.Toast = function()
{
	/**
	 * @param {Player} player
	 * @param {Player} targetPlayer
	 * @param {Card} card
	 * @param {Card} guessCard
	 * @returns {String}
	 */
	this.guard = function(player, targetPlayer, card, guessCard)
	{
		var params = {
			'toastType': 'info',
			'playerName': player.getPublicInfo().name,
			'targetName': targetPlayer.getPublicInfo().name,
			'cardName': card.name,
			'guessedCardName': guessCard.name
		};
		return jade.renderFile('views/toast/guess.jade', params);
	};

	/**
	 * @param {Player} player
	 * @param {Player} targetPlayer
	 * @param {Card} card
	 * @param {Card} comparedCard
	 * @returns {String}
	 */
	this.baron = function(player, targetPlayer, card, comparedCard)
	{
		var params = {
			'toastType': 'info',
			'playerName': player.name,
			'targetName': targetPlayer.name,
			'cardName': card.name,
			'comparedCardName': comparedCard.name
		};
		return jade.renderFile('views/toast/baron.jade', params);
	};

	return this;
};
