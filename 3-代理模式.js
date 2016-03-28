//******oop--引入问题
var Flower = function(){};

var Man = {
	sendFlower: function(proxy, target){
		proxy.receiverFlower(target);
	}
};

var Girl = {
	receiverFlower: function( flower ){
		console.log("收到花" + flower);
	},
	listenGoodMood: function( fn ){
		console.log("Girl is good mood");
		setTimeout(function(){
			fn();
		}, 2000);
	}
};

var proxyPeople = {
	receiverFlower: function(target){
		target.listenGoodMood(function(){
			var flower = new Flower();
			target.receiverFlower(flower);
		});
	}
};

Man.sendFlower(proxyPeople, Girl);

//********2.虚拟代理实现图片预加载
//虚拟代理把一些开销很大的对象延迟到真正需要时才去创建

//code in ./3-代理模式-图片预加载.html
//run in server D:\SoftwareDevelopKit\AppServ\www\jsMode\3proLoadImgByProxy

//********3.虚拟代理合并http请求
// cache 一段时间内所有网络请求, 最后一次性发送给服务器

//mainProgram => http请求
//Proxy => 收集一段时间内所用main调用 并发起最后的一次性请求

//********3.虚拟代理在惰性加载中的应用
//对于用户不一定使用的功能,可以采取插件的形式,在用户调用时再去加载对应js/image/..等资源
//eg.f2按下后再开始加载js文件/->创建对话框

//********4.缓存代理
//即proxy程序 创建并管理cache
//eg. ajax异步请求数据 分页时通常去后台拉取一次数据 再次请求直接缓存调用

var mult = function(){
	console.log("start mult");
	var result = 1;
	for( var i=0, l=arguments.length; i<l; i++){
		result *= arguments[i];
	}
	return result;
}

var proxyMult = (function(){
	var cache = {};
	return function(){
		var argsStr = Array.prototype.join.call(arguments, ",");
		if( argsStr in cache){
			return cache[argsStr];
		}
		return cache[argsStr] = mult.apply(this, arguments);             
	};
})();

console.log( proxyMult(1, 2, 3, 4) );
console.log( proxyMult(1, 2, 3, 4) );

//******创建代理工厂化
var plus = function(){
	var result = 0;
	for(var i=0, l=arguments.length; i<l; i++){
		result += arguments[i];
	}
	return result;
}

var createProxyFactory = function( fn ){
	var cache = {};
	return function(){
		var argsStr = Array.prototype.join.call(arguments, ",");
		if(argsStr in cache){
			return cache[argsStr];
		}
		return cache[argsStr] = fn.apply(this, arguments);
	};
}

var plusProxy = createProxyFactory(plus);
console.log(plusProxy(1, 2, 3, 4, 5));

//其他: 写时复制代理, 当对象被真正修改时才对他进行复制操作
//      先缓存修改内容, 统一判断写入	