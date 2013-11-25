var nodeEvents = require('events');

/**
 * @deprecated
 */
exports.events = (function(nodeEvents)
{
	var self = {};
	var eventEmitter = new nodeEvents.EventEmitter();

	/**
	 * Socket event handler
	 * @type {null|socketIO}
	 */
	self.socketIO = null;

	/**
	 * @param element
	 */
	self.click = function(element)
	{
		var card = $(element).attr('data-card');
		self.fire('card.click', card);
	};

	/**
	 * @param {string} eventName
	 * @param {object} eventParams
	 * @returns {*}
	 */
	self.fire = function(eventName, eventParams)
	{
		console.log('@deprecated EVENTS.FIRE:', eventName, eventParams);
		return null;
	};

	/**
	 * @param {string}   eventName
	 * @param {Function} callback
	 * @returns {self}
	 */
	self.catch = function(eventName, callback)
	{
		console.log('catch:', eventName);
		eventEmitter.on(eventName, function(params, event)
		{
			callback(params, event);
		});
		return self;
	};

	/**
	 * @type {boolean}
	 */
	self.enabled = true;

	self.enable = function()
	{
		self.enabled = true;
	};

	self.disable = function()
	{
		self.enabled = false;
	};

	/**
	 * @param {socketIO} io
	 */
	self.setSocketIO = function(io)
	{
		self.socketIO = io;
	};

	return self;
}(nodeEvents));
