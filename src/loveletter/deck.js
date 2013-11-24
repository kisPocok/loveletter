
/**
 * @param cardList
 * @returns {*}
 * @constructor
 */
exports.Deck = function(cardList)
{
	this.originalCards = cardList;
	this.cards         = cardList;

	/**
	 * Draw a card
	 * @returns {*}
	 */
	this.draw = function()
	{
		var card = this.cards[0];
		this.cards.splice(0, 1);
		return card;
	};

	/**
	 * Shuffle your deck
	 */
	this.shuffle = function()
	{
		var o = this.cards;
		// TODO array shuffle! :)
		for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {
			// for statement have empty body
		}
		this.cards = o;
	};

	/**
	 * Rebuild deck
	 */
	this.renew = function()
	{
		this.cards = this.originalCards;
	};

	/**
	 * @returns {int}
	 */
	this.getCardinality = function()
	{
		return this.cards.length;
	};

	return this;
};
