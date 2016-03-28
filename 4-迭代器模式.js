//*******简单的迭代器模型
var each = function( arr, callback){
	for( var i=0, l=arr.length; i<l; i++){
		callback.call(arr[i], i, arr[i]);
	}
};

each([1, 2, 3], function(i, n){
	console.log([i, n]);
});

//*******外部迭代器:必须显示地请求迭代下一个元素
var Iterator = function( obj ){
	var current = 0;

	var next = function(){
		current += 1;
	};

	var isDone = function(){
		return current >= obj.length;
	};

	var getCurrItem = function(){
		return obj[current];
	};

	return {
		next: next,
		isDone: isDone,
		getCurrItem: getCurrItem
	};
};

var compare = function(iterator1, iterator2){
	while( !iterator1.isDone() && !iterator2.isDone() ){
		if( iterator1.getCurrItem() !== iterator2.getCurrItem() ){
			throw new Error("Not Equal");
		}
		iterator1.next();
		iterator2.next();
	}

	console.log("Equal");
};

var iterator1 = new Iterator([1, 2, 3]);
var iterator2 = new Iterator([1, 2, 3]);

compare(iterator1, iterator2);

//********迭代类数组对象和字面量对象
//jQuery中 $.each()的实现
var $ = new Object();
$.isArrayLike = function( obj ){
	return !!obj.length;
};
$.each = function( obj, callback ){
	var value,
		i = 0,
		length = obj.length,
		isArray = this.isArrayLike(obj);

	if( isArray ){ //数组
		for ( ; i<length; i++){
			value = callback.call(obj[i], i, obj[i]);
			if(value === false){
				break;
			}
		}
	}else{ //对象
		for (i in obj){
			value = callback.call(obj[i], i, obj[i]);
			if(value === false){
				break;
			}
		}
	}

	return obj;
};

$.each([4, 5, 6], function(i, n){
	console.log([i, n]);
});

//*******迭代器应用--根据不同的浏览器获取响应上传组件
//迭代上传方式(钥匙串)
var getActiveUploadObj = function(){
	try{
		return new ActiveXObject("TXFTNActiveX.FTNUpload");//ie上传控件
	}catch(e){
		return false;
	}
};

var getFlashUploadObj = function(){
	if ( false ){
	// if ( supportFlash() ) {//检测是否支持flash
		var str = '<object type="application/x-shockwave-flash"></object>';
		return str;
	}
	return false;
};

var getFormUploadObj = function(){
	var str = '<input name="file" type="file" class="ui-file"></input>'
	return str;
};

var iteratorUploadObj = function(){
	for ( var i=0, fn; fn = arguments[i++]; ){
		var uploadObj = fn();
		if( uploadObj !== false ){
			return uploadObj;
		}
	}
};

var upload = iteratorUploadObj(getActiveUploadObj, getFlashUploadObj, getFormUploadObj);
console.log(upload);

//迭代器方便维护和扩展代码