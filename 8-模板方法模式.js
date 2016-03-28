//**模板方法是基于继承的设计模式
//**两部分组成:
//**1.抽象父类  2.实现子类
//**通常父类中封装了子类的算法框架/包括一些公共方法 以及封装子类所有方法的执行顺序
//**

//** Coffee or Tea
var Beverage = function(){};

Beverage.prototype.boilWater = function(){
	console.log("boilWater");
};
Beverage.prototype.brew = function(){//由子类重写
	throw new Error('this function has to be override');
}; 
Beverage.prototype.pourInCup = function(){
	throw new Error('this function has to be override');
};
Beverage.prototype.addCondiments = function(){
	throw new Error('this function has to be override');
};

Beverage.prototype.init = function(){ //模板方法
	this.boilWater();
	this.brew();
	this.pourInCup();
	this.addCondiments();
};

var Coffee = function(){};
Coffee.prototype = new Beverage();

Coffee.prototype.brew = function(){ //@override
	console.log('沸水冲泡咖啡');
};
Coffee.prototype.pourInCup = function(){ //@override
	console.log('咖啡倒进杯子');
};
Coffee.prototype.addCondiments = function(){ //@override
	console.log('加糖和牛奶');
};

var myCoffee = new Coffee();
myCoffee.init();

//JavaScript没有抽象的解决方案:
//1.鸭子类型 模拟接口检查
//2.对抽象类中方法 直接抛出异常

//使用场景:
//模板通常用于搭建项目的架构
//如HttpServlet - 生命周期
//如ui组件渲染 - 初始化容器 ajax拉起数据 数据渲染进容器中 通知渲染成功

//******钩子方法!!!!!!!!!
//父类容易变化的地方放置钩子
Beverage.prototype.customerWantsCondiments = function(){
	return true;
};
Beverage.prototype.init = function(){
	this.boilWater();
	this.brew();
	this.pourInCup();
	if( this.customerWantsCondiments() ){ //hook
		this.addCondiments();
	}
};
Coffee.prototype.customerWantsCondiments = function(){
	return false;//hook触发钩子, 可以通过进行用户询问
}
var myCoffee2 = new Coffee();
myCoffee2.init();

//****************************
//*****通过高阶函数实现模板方法
//****************************
var BeverageByJS = function( param ){
	var boilWater = function(){
		console.log('water boil');
	};
	var brew = param.brew || function(){
		throw new Error('this function has to be override');
	};
	var pourInCup = param.pourInCup || function(){
		throw new Error('this function has to be override');
	};
	var addCondiments = param.addCondiments || function(){
		throw new Error('this function has to be override');
	};

	var F = function(){};

	F.prototype.init = function(){ //模板方法 => 封装算法框架
		boilWater();
		brew();
		pourInCup();
		addCondiments();
	};

	return F;
};

var CoffeeByJS = BeverageByJS({
	brew: function(){
		console.log('coffee into boil water');
	},
	pourInCup: function(){
		console.log('pour into cup');
	},
	addCondiments: function(){
		console.log('add sugar and milk');
	}
});

var myJSCoffee = new CoffeeByJS();
myJSCoffee.init();