//区分对象内部的状态
//=> 内部状态影响对象行为的变化

//eg.电灯程序
var Light = function(){
	this.state = 'off'; //内部状态
	this.button = null;
};
Light.prototype.init = function(){	};
Light.prototype.buttonWasPressed = function(){
	if(this.state === 'off'){
		console.log('开灯');
		this.state = 'on';
	}else if(this.state === 'on'){
		console.log('关灯');
		this.state = 'off';
	}
};
var light = new Light();
light.buttonWasPressed();
light.buttonWasPressed();

//上面的程序跟状态相关的切换 不易更改变化

//状态模式 重构
var OffLightState = function(light){
	this.light = light;
};
OffLightState.prototype.buttonWasPressed = function(){
	console.log('弱光');
	this.light.setState(this.light.weakLightState); //状态切换
};

var WeakLightState = function(light){
	this.light = light;
};
WeakLightState.prototype.buttonWasPressed = function(){
	console.log('强光');
	this.light.setState(this.light.strongLightState); //强光
};

var StongLightState = function(light){
	this.light = light;
};
StongLightState.prototype.buttonWasPressed = function(){
	console.log('关灯');
	this.light.setState(this.light.offLightState); //关灯
};

var Light_demo = function(){
	this.offLightState = new OffLightState(this);
	this.weakLightState = new WeakLightState(this);
	this.strongLightState = new StongLightState(this);
	this.button = null;
};
Light_demo.prototype.init = function(){
	this.currState = this.offLightState; //init state;
};
Light_demo.prototype.setState = function(newState){
	this.currState = newState;
};
Light_demo.prototype.buttonWasPressed = function(){
	this.currState.buttonWasPressed();
};

var light_demo = new Light_demo();
light_demo.init();
light_demo.buttonWasPressed();
light_demo.buttonWasPressed();
light_demo.buttonWasPressed();

//状态模式的通用构造 及 对抽象类的变通解决方案
// Context类 -> 主类 -> 持有状态对象的引用
// State抽象父类
var State = function(){};

State.prototype.buttonWasPressed = function(){
	throw new Error('父类的buttonWasPressed必须被重写');
};

var SuperStrongLightState = function(light){
	this.light = light;
};
SuperStrongLightState.prototype = new State(); //js继承
SuperStrongLightState.prototype.buttonWasPressed = function(){
	console.log('关灯');
	this.light.setState(this.light.OffLightState);
};

//********************
//****示例:文件上传
//********************
//文件上传时的扫描 正在上传 暂停 上传成功 失败等状态切换
//以及播放器中加载播放暂停等状态切换
var winUpload = function(uploadObj, state ){
	uploadObj.changeState(state);
};

var plugin = (function(){
	var plugin = {};
	plugin.type = 'application/txftn-webkit';

	plugin.sign = function(){
		console.log('开始文件扫描');
	}
	plugin.pause = function(){
		console.log('暂停文件上传');
	}
	plugin.uploading = function(){
		console.log('开始文件上传');
	}
	plugin.del = function(){
		console.log('删除文件上传');
	}
	plugin.done = function(){
		console.log('文件上传完成');
	}
	return plugin;
})();

var Upload = function( fileName ){
	this.plugin = plugin;
	this.fileName = fileName;
	// this.button1 = null;
	// this.button2 = null;
	this.state = 'sign'; //init state waiting
}
Upload.prototype.init = function(){};
Upload.prototype.changeState = function(state){
	switch( state ){
		case 'sign':
			this.plugin.sign();
			break;
		case 'uploading':
			this.plugin.uploading();
			break;
		case 'pause':
			this.plugin.pause();
			break;
		case 'done':
			this.plugin.done();
			break;
		case 'error':
			console.log('上传失败');
			break;
		case 'del':
			this.plugin.del();
			break;
	}

	this.state = state;
};

var uploadObj = new Upload('JS设计模式与开发实践');
// winUpload(uploadObj, 'sign');
// setTimeout(function(){
// 	winUpload(uploadObj, 'uploading');
// }, 1000);
// setTimeout(function(){
// 	winUpload(uploadObj, 'done');
// }, 5000);

//条件分支十分臃肿
//状态模式重构文件上传程序
//************************

var Upload_demo = function(fileName){
	this.plugin = plugin;
	this.fileName = fileName;
	// this.button1 = null;
	// this.button2 = null;
	this.signState = new SignState(this);
	this.uploadingState = new UploadingState(this);
	this.pauseState = new PauseState(this);
	this.doneState = new DoneState(this);
	this.delState = new DelState(this);
	this.errorState = new ErrorState(this);
	this.currState = this.signState; //设置当前状态
};
Upload_demo.prototype.init = function(){
	this.bindEvent();
}
Upload_demo.prototype.bindEvent = function(){
	var self = this;
	// this.button1.onclick = function(){
	// 	self.currState.clickHandler1(); //通过currState实现状态切换
	// }
	// this.button2.onclick = function(){
	// 	self.currState.clickHandler2();
	// }
};
Upload_demo.prototype.sign = function(){
	this.plugin.sign();
	this.currState = this.signState;
};
Upload_demo.prototype.uploading = function(){
	this.plugin.uploading();
	this.currState = this.uploadingState;
};
Upload_demo.prototype.pasuse = function(){
	this.plugin.pause();
	this.currState = this.pauseState;
};
Upload_demo.prototype.done = function(){
	this.plugin.done();
	this.currState = this.doneState;
};
Upload_demo.prototype.error = function(){
	this.plugin.error();
	this.currState = this.errorState;
};
Upload_demo.prototype.del = function(){
	this.plugin.del();
	this.currState = this.delState;
};

//stateFactory
var StateFactory = (function(){
	var State = function(){};
	State.prototype.clickHandler1 = function(){
		throw new Error('子类需重写clickHandler1方法');
	};
	State.prototype.clickHandler2 = function(){
		throw new Error('子类需重写clickHandler2方法');
	};

	return function( param ){ //param中包含重写的方法
		var F = function(uploadObj){
			this.uploadObj = uploadObj;
		};
		F.prototype = new State();
		for( var i in param ){
			F.prototype[i] = param[i]
		}
		return F;
	};
})();
var SignState = StateFactory({
	clickHandler1: function(){
		console.log('扫描中,点击无效..');
	},
	clickHandler2: function(){
		console.log('文件正在上传,不能删除..');
	}
});
var UploadingState = StateFactory({
	clickHandler1: function(){
		this.uploadObj.pause();
	},
	clickHandler2: function(){
		console.log('文件正在上传,不能删除..');
	}
});
var PauseState = StateFactory({
	clickHandler1: function(){
		this.uploadObj.uploading();
	},
	clickHandler2: function(){
		this.uploadObj.del();
	}
});
var DoneState = StateFactory({
	clickHandler1: function(){
		console.log('文件上传完成');
	},
	clickHandler2: function(){
		this.uploadObj.del();
	}
});
var ErrorState = StateFactory({
	clickHandler1: function(){
		console.log('文件上传失败,点击无效..');
	},
	clickHandler2: function(){
		this.uploadObj.del();
	}
});
var DelState = StateFactory({
	clickHandler1: function(){
		console.log('文件已删除');
	},
	clickHandler2: function(){
		console.log('文件已删除');
	}
});

var uploadObj_demo = new Upload_demo('js pattern');
uploadObj_demo.sign();

// setTimeout(function(){
// 	uploadObj_demo.uploading();
// }, 1000);
// setTimeout(function(){
// 	uploadObj_demo.done();
// }, 5000);

//***********************
//******JavaScript状态机
//***********************
var Light_byFSM = function(){
	this.currState = FSM.on;
	// this.button = null;
};
Light_byFSM.prototype.init = function(){};
Light_byFSM.prototype.press = function(){
	this.currState.buttonWasPressed.call(this); //**//**
};

var FSM = {
	off:{
		buttonWasPressed: function(){
			console.log('关灯');
			this.currState = FSM.on;
		}
	},
	on:{
		buttonWasPressed: function(){
			console.log('开灯');
			this.currState = FSM.off;
		}
	}
};

var light_fsm = new Light_byFSM();
// light_fsm.press();
// light_fsm.press();
// light_fsm.press();

//delegate 委托
var delegate = function( client, delegation ){
	return {
		buttonWasPressed: function(){
			return delegation.buttonWasPressed.apply(client, arguments);
		}
	}
}

var Light_byDeg = function(){
	this.offState = delegate(this, FSM.off);
	this.onState = delegate(this, FSM.on);
	this.currState = this.onState;
}
Light_byDeg.prototype.press = function(){
	this.currState.buttonWasPressed();
};
var light_deg = new Light_byDeg();
light_deg.press();

//表驱动的有限状态机
//github: javascript-state-machine

//实际项目中的其他状态机
//游戏AI
var MenFSM = {
	walk: {
		attack: function(){
			console.log('attack')
		},
		defense: function(){
			console.log('defense');
		},
		jump: function(){
			console.log('jump');
		}
	},
	attack: {
		walk: function(){},//cannot walk while attack
		defense: function(){},//cannot defense while attck
		jump: function(){}//cannot jump while attack
	}
}