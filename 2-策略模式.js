//******1.oop
var strategyA = function(){};
strategyA.prototype.do = function(){
	//to do
	console.log("A 计算方式");
}

var strategyB = function(){};
strategyB.prototype.do = function(){
	//to do
	console.log("B 计算方式");
}

var strategyC = function(){};
strategyC.prototype.do = function(){
	//to do
	console.log("C 计算方式");
}

var Context = function(strategy){
	this.strategy = strategy;
	this.result = 0;
};
Context.prototype.do = function(){
	this.strategy.do();
}

var contA = new Context(new strategyA);
var contB = new Context(new strategyB);
var contC = new Context(new strategyC);
contA.do();
contB.do();
contC.do();

//********2.js 策略
var Strategy = {
	"A": strategyA.prototype.do,
	"B": strategyB.prototype.do,
	"C": strategyC.prototype.do
};

var contFn = function(ind){
	Strategy[ind]();
}

contFn("A");
contFn("B");
contFn("C");

//***********3.缓动动画库的基本建立
//策略模式第一种应用--算法系列的建立,单独抽出作用相同的算法,便于后续使用
var tween = {//策略算法
	//t-动画已消耗时间 b-小球原始位置 c-小球目标位置 d-动画持续总时间
	linear: function(t, b, c, d){
		return c*t/d + b;
	},
	easeIn: function(t, b, c, d){
		return c * (t/=d) * t + b;
	},
	strongEaseIn: function(t, b, c, d){
		return c * (t/=d) *t *t *t *t + b;
	},
	strongEaseOut: function(t, b, c, d){
		return c * ((t = t/d - 1) *t *t *t *t + 1) + b;
	},
	sineaseIn: function(t, b, c, d){
		return c * (t/=d) *t *t + b;
	},
	sineaseOut: function(t, b, c, d){
		return c * ((t = t/d - 1) *t *t + 1) + b;
	}
};

var likeAnimate = function(endPos, duration, easing){
	this.startTime = null,
	this.startPos = 0,
	this.endPos = endPos,
	this.duration = duration || 1000;
	this.easing = tween[easing || "linear"];//策略控制
}

likeAnimate.prototype.start = function(){
	this.startTime = +new Date();
	var self = this;
	var timeHandler = setInterval(function(){
		if(self.step() === false){
			clearInterval(timeHandler);
		}
	}, 19)
};

likeAnimate.prototype.step = function () {
	var t = +new Date();
	if(t >= this.duration + this.startTime){
		this.update(this.endPos);
		return false;
	}
	//策略应用
	var pos = this.easing(t-this.startTime, this.startPos, this.endPos-this.startPos, this.duration);
	this.update(pos);
}

likeAnimate.prototype.update = function (pos) {
	console.log(pos);
}

// var linearAnimate = new likeAnimate(100, 1000, "linear");
// linearAnimate.start();

// var easeInAnimate = new likeAnimate(100, 1000, "easeIn");
// easeInAnimate.start();

//*************4.表单验证
//策略模式第二种应用--对于if-else的优化/多种校验规则的使用

//这里通过node输入模拟-多验证的策略模式
var InputStrategies = {
	isNonEmpty: function(value, errorMsg){
		if( value === ''){
			return errorMsg;
		}
	},
	minLength: function(value, length, errorMsg){
		if(value.length < length){
			return errorMsg;
		}
	},
	isMobile: function(value, errorMsg){
		if( !/(^1[3|5|8][0-9]{9}$)/.test(value) ){
			return errorMsg;
		}
	}
};

var InputValidator = function(){
	this.cache = [];
};

InputValidator.prototype.add = function(inputValue, rules){
	var self = this;

	for(var i=0, rule; rule = rules[i++]; ){
		(function(rule){
			var strategyArg = rule.strategy.split(':');
			var errorMsg = rule.errorMsg;

			self.cache.push(function(){
				var strategy = strategyArg.shift();
				strategyArg.unshift(inputValue);
				strategyArg.push(errorMsg);
				return InputStrategies[strategy].apply(null, strategyArg);
			});
		})(rule);
	}
}

InputValidator.prototype.start = function(){
	for( var i=0, validatorFn; validatorFn = this.cache[i++]; ){
		var errorMsg = validatorFn();
		if( errorMsg ){
			return errorMsg;
		}
	}
};

var validataFn = function(inputValue){
	var validator = new InputValidator();

	validator.add(inputValue, [{
		strategy: 'isNonEmpty',
		errorMsg: '用户名不能为空'
	}, {
		strategy: 'minLength:6',
		errorMsg: '用户名长度不能小于10'
	}]);

	validator.add(inputValue, [{
		strategy: 'isMobile',
		errorMsg: '手机格式不正确'
	}]);

	var errorMsg = validator.start();
	return errorMsg;
};

var myConsole = require('./myConsole');

myConsole.gets(function(chunk){
	var inputValue = chunk.trim();
	var errorMsg = validataFn(inputValue);
	if(errorMsg){
		console.log(errorMsg);
	}else{
		console.log("Success!");
	}
});