var nodeEvents = require('events');

var Events = (function(nodeEvents)
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
		console.log('EVENT FIRE:', eventName, eventParams);
		return null;

		try {
			if (!self.enabled) {
				return null;
			}
			console.log('srv.events.fire:', eventName, eventParams ? ':: ' + typeof eventParams : '');

			eventEmitter.emit(eventName, eventParams||{});
			if (self.socketIO) {
				return self.socketIO.emit(eventName, eventParams||{});
			}
		} catch (er) {
			console.error('Events.fire FAILED', er);
			return false;
		}

		return true;
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

// Node export
exports.events = Events;