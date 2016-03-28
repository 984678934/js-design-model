//*****
//*****即观察者模式
//*****
//*****发布订阅-异步编程中 替代传递回调函数的方案
//*****取消对象之间硬编码的通知机制 - 一个对象不需要显示调用另一个对象api

//*****eg. dom事件

//*****自定义事件的通用实现
var event = {
	clientList: [],
	listen: function(key, fn){
		if( !this.clientList[key] ){
			this.clientList[key] = [];
		}
		this.clientList[key].push(fn);
	},
	trigger: function(){
		var key = Array.prototype.shift.call(arguments),
			fns = this.clientList[key];

		if( !fns || fns.length === 0 ){
			return false;
		}

		for(var i=0, fn; fn = fns[i++]; ){
			fn.apply(this, arguments);
		}
	},
	remove: function(key, fn){
		var fns = this.clientList[key];

		if( !fns ){
			return false;
		}
		if( !fn ){
			fns && (fns.length = 0); //移除所有监听函数
		}else{
			for( var l=fns.length-1; l>=0; i--){
				var _fn = fns[l];
				if( _fn === fn){ //无法移除匿名函数
					fns.splice(l, 1);
				}
			}
		}
	}
};

var installEvent = function(obj){
	for(var i in event){ //实际共享一个event
		//解决共享问题 => 改为oop => new event(); 实例化即可
		obj[i] = event[i];
	}
};

//test
var Office = {};
installEvent(Office);

Office.listen("pushInfoA", function(argStr){ //订阅
	console.log("A:" + argStr);
});

Office.listen("pushInfoB", function(argStr){ //订阅
	console.log("B:" + argStr);
});

Office.trigger("pushInfoA", "xiaoming"); // 发布
Office.trigger("pushInfoB", "xiaohong");

//*****应用--组件间的相互监听--网站登录
//当用户登录成功后导航条 用户信息列表..等都需要刷新信息
//业务逻辑:loginSuccess => nav././.refresh();
//不利于组件维护耦合性太强
//改进为:nav././.listen() => loginSuccess

var login = (function(){
	var login = {};
	installEvent(login);
	login.log = function(){
		//ajax => 后台登陆操作
		console.log("log in success!");
		this.trigger("loginSucc", "ZJD");
	};
	return login;
})();

var header = (function(){
	login.listen("loginSucc", function(data){
		header.setFresh(data);
	});
	return {
		setFresh: function(data){
			console.log("HeaderFresh:"+data);
		}
	};
})();

var cartList = (function(){
	login.listen("loginSucc", function(data){
		cartList.setFresh(data);
	});
	return {
		setFresh: function(data){
			console.log("CartListFresh:"+data);
		}
	};
})();

login.log();

//******全局模式的Event
//即对象不安装event. 发布者=>触发指定事件 订阅者=>监听指定事件

var Event = (function(){
	var _event = {};
	installEvent(_event);
	return _event;
})();

Event.listen("loginSucc", function(data){
	console.log("GlobalVar:"+data);
});
Event.trigger("loginSucc", "global");

//根据结果可知installEvent所安装的是同一个event


//*****自己实现 先发布 再订阅 模式
//原理:
//先将发布的事件堆栈,当有对象订阅事件时,遍历堆栈.重新发布(执行命令)

//*****为全局事件 添加命名空间解决冲突

var GlobalEvent = (function(){
	var global = this,
		Event,
		_default = 'default';

	Event = function(){
		var _listen,
			_trigger,
			_remove,
			_slice = Array.prototype.slice,
			_shift = Array.prototype.shift,
			_unshift = Array.prototype.unshift,
			namespaceCache = {},
			_create,
			find,
			each = function(arr, fn){
				var ret;
				for( var i=0, l=arr.length; i<l; i++){
					var n = arr[i];
					ret = fn.call(n, i, n);
				}
				return ret;
			};

		_listen = function( key, fn, cache ){
			if( !cache[key] ){
				cache[key] = [];
			}
			cache[key].push(fn); //cache?
		};

		_remove = function( key, cache, fn ){
			if( cache[key] ){
				if( fn ){
					for( var i=cache[key].length; i>=0; i--){
						if(cache[key] === fn){
							cache[key].splice(i, 1);
						}
					}
				}else{
					cache[key] = [];
				}
			}
		};

		_trigger = function(){
			var cache = _shift.call(arguments),
				key = _shift.call(arguments),
				args = arguments,
				_self = this,
				ret,
				stack = cache[key];
			if( !stack || !stack.length ){
				return;
			}
			return each(stack, function(){//遍历所有监听函数
				return this.apply(_self, args);
			});
		};

		_create = function(namespace){
			var namespace = namespace || _default;
			var cache = {},
				offlineStack = [],	//离线事件
				ret = {
					listen: function( key, fn, last ){
						_listen(key, fn, cache);
						if( offlineStack === null ){
							return;
						}
						if( last === 'last' ){
							offlineStack.length && offlineStack.pop()();
						}else{
							each( offlineStack, function(){
								this();
							});
						}
						offlineStack = null;
					},
					one: function( key, fn, last){
						_remove(key, cache);
						this.listen(key, fn, last);
					},
					remove: function(key, fn){
						_remove(key, cache, fn);
					},
					trigger: function(){
						var fn,
							args,
							_self = this;

						_unshift.call(arguments, cache);
						args = arguments;
						fn = function(){
							return _trigger.apply(_self, args);
						};

						if( offlineStack ){
							return offlineStack.push(fn);
						}
						return fn();
					}
				};

				return namespace ? 
						(namespaceCache[namespace] ? 
							namespaceCache[namespace] : 
								namespaceCache[namespace] = ret) : ret;
		};

		return {
			create : _create, //创建命名空间
								//内部分配新的event对象方法
			one: function(key, fn, last){
				var event = this.create();
				event.one(key, fn, last);
			},
			remove: function(key, fn){
				var event = this.create();
				event.remove(key, fn);
			},
			listen: function(key, fn, last){
				var event = this.create();
				event.listen(key, fn, last);
			},
			trigger: function(){
				var event = this.create();
				event.trigger.apply(this, arguments);
			}
		};
	}();

	return Event;
})();

// GlobalEvent.trigger("click", 1);
// GlobalEvent.listen("click", function(a){
// 	console.log("xxA"+a);
// });
// GlobalEvent.listen("click", function(a){
// 	console.log("xxB"+a);
// });

GlobalEvent.trigger("click", 1);
GlobalEvent.listen("click", function(a){
	console.log("A"+a);
}, "last");
// GlobalEvent.listen("click", function(a){
// 	console.log("B"+a);
// });
GlobalEvent.trigger("click", 2);