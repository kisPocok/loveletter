
/*
 * GET home page.
 */
exports.index = function(request, response)
{
	var params = {
		title: 'Love Letter'
	};
	response.render('index', params);
};

exports.gamePlay = function(request, response)
{
	var params = {
		'roomName': request.params.name
	};
	response.render('gameplay', params);
};

exports.api = function(request, response)
{
	var object = request.params.object;
	var method = request.params.method;
	response.send({
		object: object,
		method: method,
	});
};
