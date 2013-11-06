
var socket = io.connect('http://127.0.0.1');
socket.on('news', function (data)
{
	console.log(data);
	socket.emit('my other event', { my: 'data' });
});
socket.on('*', function(data, a)
{
	console.log(a, data);
});
