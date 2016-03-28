//*****1.单例的建立
var singleClass = (function(){
	var instance = null;

	var singleClass = function(args){
		if(instance){
			return instance;
		}
		this.args = args;
		instance = this;	//单例的建立//
	}

	singleClass.prototype.init = function(){
		//TO DO
		console.log(this.args);
	};

	return singleClass;
})();

var singleObjA = new singleClass("A");
var singleObjB = new singleClass("B");
singleObjA.init();
singleObjB.init();
//单例的建立与对象构造函数耦合太深

//*****2.通过代理工厂实现单例模式
var single = function(args){
	this.args = args;
}
single.prototype.init = function () {
	// to do
	console.log(this.args);
}

var SingleProxyFactory = function(singleModel){//通过已有类进行单例实现
	var instance = null;
	return function(args){
		if(instance){
			return instance;
		}
		return instance = new singleModel(args);
	}
}

var singleFn = SingleProxyFactory(single);
var singleObjAByProxy = singleFn("A Proxy");
var singleObjBByProxy = singleFn("B Proxy");
singleObjAByProxy.init();
singleObjBByProxy.init();

//*****3.惰性单例
var getSingle = function (fn) {//生成单例 并管理
	var singleObj = null;
	return function(){
		return singleObj || (singleObj = fn.apply(this, arguments));
	}
};

var createFn = function(args){//创建对象 并不知道是否是单例
	return new single(args);
}

var singleTon = getSingle(createFn);
var singleObjAByJS = singleTon("A js"); //singleObj被创建
singleObjAByJS.init();
var singleObjBByJS = singleTon("B js");;
singleObjAByJS.init();


//*******4.ex.浮窗的建立