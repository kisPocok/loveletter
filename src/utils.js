function isFunction(object) {
	return typeof(object) == "function";
}

function isInt(n) {
	return typeof n === 'number' && n % 1 == 0;
}

function createHTMLCard(card)
{
	return card ? '<a class="card" data-card="' + card.name + '" onclick="Events.click(this);">' + card.name + '</a>' : '';
}

function renderHand(player)
{
	var renderTo = $('#p' + player.id);
	var content  = createHTMLCard(player.cardsInHand[0]);
	if (player.cardsInHand.length === 2) {
		content += createHTMLCard(player.cardsInHand[1]);
	}
	renderTo.html(content);
}

function runBasicGame()
{
	Events
		.catch('game.start', function(response, event) {
			console.log('A játék kezdetét veszi!');
			setTimeout('Events.enable()',1000);
		})
		.catch('game.newPlayer', function(player, event) {
			console.log('Új játékos csatlakozott:', player.name);
		})
		.catch('game.nextPlayer', function(player, event) {
			console.log('A következő játékos:', player.name);
			$('#p1, #p2').removeClass('active');
			$('#p' + player.id).toggleClass('active');
		})
		.catch('player.attack', function(response, event) {
			console.warn(response.player.name + ' kijátszotta a következő lapot: ', response.card.name);
			console.log('Hatása:', response.card.description);
			console.log('Sikerült?', response.response);
			// TODO handle attack response.response!!!!!
			renderHand(response.player);
			App.nextPlayer();
		})
		.catch('game.end', function(response, event) {
			console.log('A játék véget ért!');
		})
		.catch('player.draw', function(response, event) {
			console.debug(response.player.name, 'lapot húzott:', response.card.name);
			renderHand(response.player);
		})
		.catch('card.click', function(card) {
			card = Cards.get(card.toLowerCase());
			var params = {
				card: card,
				deck: x.getDeck()
			};
			if (Game.isCardNeedPrompt(card)) {
				// TODO
				var guess;
				if (guess = prompt('Melyik kártyát választod? (2-től 8-ig írj egy számot!)')) {
					params.guess = guess * 1;
					Events.fire('card.play', params);
				}
			} else {
				Events.fire('card.play', params);
			}
		})
		.catch('card.play', function(params) {
			var card   = params.card;
			var player = App.getActivePlayer();
			var targetPlayer = App.getAllPlayers()[1];
			if (Game.isPlayableCard(card, player, targetPlayer, params)) {
				player.attack(Game, card, targetPlayer, params)
			} else {
				console.log('Ezt a kártyát nem tudod kijátszani most!');
			}
		});


	var x = App;
	x.addPlayer('Szandi');
	x.addPlayer('Dávid');
	x.startGame();
	Events.disable();

	/*
	var attackParams = {
		guess: 2,
		deck:  x.getDeck()
	};

	for (var i = 0; i<0; i++) {
		// P1 round
		var targetPlayer = x.getAllPlayers()[1]
		var p  = x.getActivePlayer();
		var c  = p.cardsInHand[0];
		var c2 = p.cardsInHand[1];
		var validC = Game.isPlayableCard(c, p, targetPlayer, attackParams) ? c : c2;
		p.attack(Game, validC, targetPlayer, attackParams);
		try {
			p.getTheCard()
			x.nextPlayer();
		} catch (e) {
			console.error('Túl sok kártya!')
		}

		// P2 round
		var targetPlayer = x.getAllPlayers()[0]
		var p  = x.getActivePlayer();
		var c  = p.cardsInHand[0];
		var c2 = p.cardsInHand[1];
		var validC = Game.isPlayableCard(c, p, targetPlayer, attackParams) ? c : c2;
		p.attack(Game, validC, targetPlayer, attackParams);
		x.nextPlayer();
	}
	*/
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
	createHTMLCard: createHTMLCard,
	renderHand: renderHand,
	runBasicGame: runBasicGame,
	getCookie: getCookie,
	clone: clone
};