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
			'playerName': player.name,
			'targetName': targetPlayer.name,
			'cardName': card.name,
			'guessedCardName': guessCard.name
		};
		return jade.renderFile('views/toast/guess.jade', params);
	};

	/**
	 * @param {Player} player
	 * @param {Player} targetPlayer
	 * @param {Card} card
	 * @returns {String}
	 */
	this.priest = function(player, targetPlayer, card)
	{
		var params = {
			'toastType': 'info',
			'playerName': player.name,
			'targetName': targetPlayer.name,
			'cardName': card.name
		};
		console.log(params);
		return jade.renderFile('views/toast/priest.jade', params);
	};

	/**
	 * @param {Player} player
	 * @param {Player} targetPlayer
	 * @param {Card} card
	 * @param {Card} opponentCard
	 * @returns {String}
	 */
	this.priestYourself = function(player, targetPlayer, card, opponentCard)
	{
		var params = {
			'toastType': 'info',
			'playerName': player.name,
			'targetName': targetPlayer.name,
			'cardName': card.name,
			'opponentCardName': opponentCard.name
		};
		return jade.renderFile('views/toast/priestYourself.jade', params);
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
