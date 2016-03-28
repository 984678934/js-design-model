//职责链:
//使多个对象都有机会处理请求,从而避免请求的发送者和接收者之间的耦合
//将这些对象连成一条链, 并沿着这条链传递该请求, 直到有一个对象处理请求

//利用职责链化解多分支条件语句
//eg.订单开发
//order 500定金 -> 可获得100购物券
//order 200定金 -> 可获得50购物券
//order 没有定金 -> 没有购物券 普通购买

//进行通用对象拆分职责链节点
var order500 = function (orderType, pay, stock) {
	if ( orderType === 1 && pay === true) {
		console.log('500元订金预购, 得到100优惠券');
	} else {
		return 'nextSuccessor'; //pass request
	}
}

var order200 = function (orderType, pay, stock) {
	if ( orderType === 2 && pay === true) {
		console.log('200元订金预购, 得到50优惠券');
	} else {
		return 'nextSuccessor'; //pass request
	}
}

var orderNormal = function (orderType, pay, stock) {
	if ( stock > 0) {
		console.log('普通购买, 无优惠券');
	} else {
		console.log('手机库存不足');
	}
}

var Chain = function ( fn) {
	this.fn = fn;
	this.successor = null;
}
Chain.prototype.setNextSuccessor = function( successor ){
	return this.successor = successor;
}
Chain.prototype.passRequest = function(){
	var ret = this.fn.apply( this, arguments);

	if ( ret === 'nextSuccessor' ){
		return this.successor && this.successor.passRequest.apply(this.successor, arguments);
	}

	return ret;
}

var chainOrder500 = new Chain( order500 );
var chainOrder200 = new Chain( order200 );
var ChainOrderNormal = new Chain( orderNormal );

chainOrder500.setNextSuccessor(chainOrder200);
chainOrder200.setNextSuccessor(ChainOrderNormal);
//节点顺序更灵活增加//移除//修改

chainOrder500.passRequest(1, true, 500);
chainOrder500.passRequest(2, true, 500);
chainOrder500.passRequest(3, true, 500);
chainOrder500.passRequest(1, false, 0);

//可以通过异步职责链 加上命令模式 -> 构建ajax异步队列库

//链尾 增加一个保底的接受者节点 来处理escape情况
//职责链模式可能存在堆栈的限制 -> 可优化

//AOP面向切面实现职责链
Function.prototype.after = function ( fn ) {
	var self = this;
	return function(){
		var ret = self.apply(this, arguments);
		if( ret === 'nextSuccessor' ){
			return fn.apply( this, arguments);
		}

		return ret;
	};
};

var order = order500.after(order200).after(orderNormal);
order(1, true, 500);
order(2, true, 500);
order(1, false, 500);

//重构eg获取文件上传对象
var getActiveUploadObj = function(){
	try{
		// 获取ie上传组件
		// return new ActiveXOject("TXFTNActiveX.FTNUpload");
		// console.log("ie upload");
		throw new Error();
	} catch (e){
		return 'nextSuccessor';
	}
};

var getFlashUploadObj = function(){
	if( false ){
		//flash上传组件
	// if( supportFlash() ){
	// 	var str = '<object type="application/x-shockwave-flash"></object>';
	// 	return $(str).appendTo($('body'));
		console.log('flash upload');
	}
	return 'nextSuccessor';
};

var getFormUploadObj = function(){
	console.log('form upload');
};

var getUploadObj = getActiveUploadObj.after( getFlashUploadObj ).after( getFormUploadObj );

getUploadObj();