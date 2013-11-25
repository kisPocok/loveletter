
function isFunction(object) {
	return typeof(object) == "function";
}

function isInt(n) {
	return typeof n === 'number' && n % 1 == 0;
}

function getCookie(cookieName, cookieValue)
{
	var start = cookieValue.indexOf(" " + cookieName + "=");
	if (start == -1) {
		start = cookieValue.indexOf(cookieName + "=");
	}

	if (start == -1) {
		cookieValue = null;
	} else {
		start = cookieValue.indexOf("=", start) + 1;
		var end = cookieValue.indexOf(";", start);
		if (end == -1) {
			end = cookieValue.length;
		}
		cookieValue = unescape(cookieValue.substring(start, end));
	}
	return cookieValue;
}

function clone(obj)
{
	if(obj == null || typeof(obj) != 'object') return obj;
	var temp = obj.constructor(); // changed
	for(var key in obj) temp[key] = clone(obj[key]);
	return temp;
}

// Node
exports.utils = {
	isFunction: isFunction,
	isInt: isInt,
	getCookie: getCookie,
	clone: clone
};
