//给对象动态地增加职责

//传统的装饰者 -> 继承实现
var Plane = function(){};
Plane.prototype.fire = function(){
	console.log('发射普通子弹');
};

var MisssileDecorator = function(plane){
	this.plane = plane;
};
MisssileDecorator.prototype.fire = function(){
	this.plane.fire();
	console.log('发射导弹');
};

var AtomDecorator = function(plane){
	this.plane = plane;
};
AtomDecorator.prototype.fire = function(){
	this.plane.fire();
	console.log('发射原子弹');
};

var plane = new Plane();
plane = new MisssileDecorator(plane);
plane = new AtomDecorator(plane);
plane.fire();

//js -> 装饰函数
//缺点: 需要维护中间变量
//		可能遇到this被劫持
var a = function(){
	console.log(1);
};

var _a = a;
a = function(){ //通过中间变量保存原函数进行装饰
	_a();
	console.log(2);
};
a();

//AOP装饰函数
Function.prototype.before = function( beforefn ){
	var _self = this;
	return function(){
		beforefn.apply(this, arguments); //先执行装饰函数
		return _self.apply(this, arguments); //再执行self函数
	}
};

Function.prototype.after = function( afterfn ){
	var _self = this;
	return function(){
		var ret = _self.apply(this, arguments);
		afterfn.apply(this, arguments);
		return ret;
	}
};

var test = function(){
	console.log("*1*");
};
var testBefore = test.before(function(){
	console.log("*2*");
});
testBefore();

var abefore = a.before(function(){
	console.log("*a*");
});
abefore();

//*************************
//***AOP实际应用
//*************************

//1.数据上报
var showLogin = function(){
	console.log('打开登陆浮层');
};
var log = function(){
	console.log('上报标签为:'+'...');
	// (new Image).src = 'http/xxx.com/report?tag='; //实际上报数据
};
showLogin = showLogin.after(log);
showLogin();

//2.动态改变函数参数
var func = function( param ){
	console.log( param ); //{a:'a', b:'b'}
}

func = func.before(function(param){
	param.b = 'b';
});

func({a: 'a'});

//ajax aop
var getToken = function(){
	return 'Token'; //CSRF-解决
}
var ajax = function(type, url, param){
	console.log(param);
}
ajax = ajax.before(function(type, url, param){
	param.Token = getToken();
});

ajax('get', 'http://xxx.com/userInfo', {name: 'sven'});

//3.插件式的表单验证
var validata = function(username, password){
	if(username.value === ''){
		console.log('用户名不能为空');
		return false;
	}
	if(password.value === ''){
		console.log('密码不能为空');
		return false;
	}
}
var formSubmit = function(username, password){
	var param = {
		username: username.value,
		password: password.value
	};
	ajax('get', 'http://xxx.com/login', param);
}
formSubmit = formSubmit.before(validata);

formSubmit({value: 'zjd'}, {value: 'xxx'});

//装饰着模式叠加了函数作用域
//会对性能有一定影响