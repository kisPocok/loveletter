
/*
 * GET home page.
 */
exports.index = function(request, response)
{
	var userId = request.cookies.userId;
	if (!userId) {
		userId = Math.floor(Math.random() * 1500000);
	}
	response.cookie('userId', userId, {maxAge: 900000, httpOnly: true});
	console.log(userId);

	var params = {
		title: 'Love Letter'
	};
	response.render('index', params);
};
