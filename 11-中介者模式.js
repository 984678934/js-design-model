//多个对象之间的复杂网状关系
//可以优化成中介者模式

//****************
//泡泡堂游戏
//****************
//oop 不使用中介者
var players = [];

function Player(name, teamColor){
	this.partners = []; // 队友列表
	this.enemies = []; // 敌人列表
	this.state = 'live'; // 玩家状态
	this.name = name; // 角色名字
	this.teamColor = teamColor; // 队列颜色
}

Player.prototype.win = function(){
	console.log('winner: ' + this.name);
};
Player.prototype.lose = function(){
	console.log('loser: ' + this.name);
};

Player.prototype.die = function(){//玩家死亡
	var all_dead = true;

	this.state = 'dead';
	for( var i=0, partner; partner = this.partners[i++]; ){
		if( partner.state !== 'dead'){
			all_dead = false;
			break;
		}
	}

	if( all_dead === true ){//队友全部死亡
		this.lose();
		for( var i=0, partner; partner = this.partners[i++]; ){
			partner.lose(); //通知所有队友游戏失败
		}
		for( var i=0, enemy; enemy = this.enemies[i++]; ){
			enemy.win();
		}
	}
};

var playerFactory = function(name, teamColor){ // 管理队友 敌人
	var newPlayer = new Player(name, teamColor);

	for(var i=0, player; player = players[i++]; ){
		if( player.teamColor === newPlayer.teamColor){
			player.partners.push( newPlayer );
			newPlayer.partners.push(player);
		} else {
			player.enemies.push( newPlayer);
			newPlayer.enemies.push(player);
		}
	}

	players.push(newPlayer);
	return newPlayer;
}

//red team
var player1 = playerFactory('皮蛋', 'red'),
	player2 = playerFactory('小乖', 'red'),
	player3 = playerFactory('宝宝', 'red'),
	player4 = playerFactory('小强', 'red');
//blue team
var player5 = playerFactory('黑妞', 'blue'),
	player6 = playerFactory('葱头', 'blue'),
	player7 = playerFactory('胖墩', 'blue'),
	player8 = playerFactory('海盗', 'blue');

player1.die();
player2.die();
player3.die();
player4.die();

//************************************
// 通过中介者模式优化 房间中的玩家管理
//************************************

Player.prototype.die = function(){
	this.state = 'dead';
	playerDirector.ReceiveMessage('playerDead', this); //给中介者发送消息
};
Player.prototype.remove = function(){
	playerDirector.ReceiveMessage('removePlayer', this);
};
Player.prototype.changeTeam = function(color){
	playerDirector.ReceiveMessage('changeTeam', this, color);
};

var playerFactory_demo = function(name, teamColor){
	var newPlayer = new Player(name, teamColor); //新对象
	playerDirector.ReceiveMessage('addPlayer', newPlayer);

	return newPlayer;
};

//1.利用发布订阅模式
//2.playerDirector中开放一些api接口

var playerDirector = ( function(){
	var players = {},//所有玩家
		operations = {}; //中介者所有操作

	operations.addPlayer = function( player ){
		var teamColor = player.teamColor;
		players[teamColor] = players[teamColor] || []; //成立队伍

		players[teamColor].push(player);
	};

	operations.removePlayer = function( player ){
		var teamColor = player.teamColor,
			teamPlayers = players[teamColor] || [];
		for( var i=teamPlayers.length-1; i>=0; i--){
			if( teamPlayers[i] === player ){
				teamPlayers.splice(i, 1);
			}
		}
	};

	operations.changeTeam = function(player, newTeamColor){
		operations.removePlayer(player);
		player.teamColor = newTeamColor;
		operations.addPlayer(player);
	};

	operations.playerDead = function(player){
		var teamColor = player.teamColor,
			teamPlayers = players[teamColor];

		var all_dead = true;

		for( var i=0, partner; partner = teamPlayers[i++]; ){
			if( partner.state !== 'dead'){
				all_dead = false;
				break;
			}
		}

		if( all_dead === true ){//队友全部死亡
			for( var i=0, partner; partner = teamPlayers[i++]; ){
				partner.lose(); //通知所有队友游戏失败
			}
			
			for(var color in players){
				if( color !== teamColor ){
					var teamPlayers = players[color];
					for(var i=0, player; player = teamPlayers[i++]; ){
						player.win();
					}//其他队伍所有成员win
				}
			}
		}
	};

	var ReceiveMessage = function(){
		var message = Array.prototype.shift.call(arguments);
		operations[message].apply(this, arguments);
	};

	return {
		ReceiveMessage: ReceiveMessage
	};
})();

//red team
var player9 = playerFactory_demo('皮蛋', 'red'),
	player10 = playerFactory_demo('小乖', 'red'),
	player11 = playerFactory_demo('宝宝', 'red'),
	player12 = playerFactory_demo('小强', 'red');
//blue team
var player13 = playerFactory_demo('黑妞', 'blue'),
	player14 = playerFactory_demo('葱头', 'blue'),
	player15 = playerFactory_demo('胖墩', 'blue'),
	player16 = playerFactory_demo('海盗', 'blue');

// player13.die();
// player14.die();
// player15.die();
// player16.die();

// player13.remove();
// player14.remove();
// player15.die();
// player16.die();

player13.changeTeam('red');
player14.die();
player15.die();
player16.die();

//****************************
//eg.购买商品
//****************************
//通过中介者模式优化对象与对象之间的复杂耦合度
//当一个输入框对象发生变化 组件内的子组件都会发生变化
//这里对象间的通知是复杂的网状结构
//重构 -> 对象变化通知中介者 中介者控制其他子组件的变化