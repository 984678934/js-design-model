//******应用场景
//******需要向某些对象发送请求,但是并不知道请求的接收者,也不知道被请求的操作
//******eg. 顾客订餐 => 菜单./发布命令   厨师 => 菜单./执行命令
//******    两者没有松耦合  

//******eg.菜单程序
//******

//******
//Command对象接收执行对象, 并将操作封装, setCommand将请求者和命令联系起来

var validateCommand = function(receiver){
	return {
		execute: function(args){ //封装命令
			receiver.validate(args);
		}
	};
};

var setCommand = function( gets, command){
	gets(function(args){
		command.execute(args);
	});
}

var myConsole = require('./myConsole');

var valiteObj = {
	validate: function(args){
		console.log("VALIDATE:"+args);
	}
};
var valiCom = validateCommand(valiteObj);

// setCommand(myConsole.gets, valiCom);

//********实践--建立命令堆栈--支持撤销或重做命令

var actionFn = {
	attack: function(){
		console.log("攻击！");
	},
	defense: function(){
		console.log("防御！");
	},
	jump: function(){
		console.log("跳跃！");
	},
	crouch: function(){
		console.log("蹲下！");
	},
	replay: function(){
		var command;
		for( var i=0; command = commandStack[i]; i++){
			command();
		}
	}
};

var commandFactory = function(receiver, action){
	return function(){
		receiver[action]();
	};
};

var commandStack = [];

myConsole.gets(function(chunk){
	var comQuest = {
		"w": "jump",
		"s": "crouch",
		"a": "defense",
		"d": "attack",
		"r": "replay"
	};
	//建立命令: 发起者 与 接收者
	var command = commandFactory(actionFn, comQuest[chunk.trim()]);

	if( command ){
		command();
		chunk.trim()!=='r' && commandStack.push( command );//堆栈
	}
});
//可以看到命令模式的好处
//每次执行命令都是一个单独的对象实例, 执行日志有据可依

//可将多个命令依次组装成宏命令