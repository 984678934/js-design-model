//flyweight享元 => 性能优化
//核心: 运用共享技术来有效支持大量细粒度的对象

//内部状态相同的对象都指定为同一个共享对象 -->> 对象工厂
//外部状态从对象身上剥离, 并储存在外部  -->> 管理器管理外部状态

//****eg.文件上传
//同时上传大批文件时, new uploadObj => 对象爆炸

//模拟对象爆炸/支持同时选择2000个文件
var id = 0;

var startUpload = function(uploadType, files){
	for( var i=0, file; file=files[i++]; ){
		var uploadObj = new Upload(uploadType, file.fileName, file.fileSize);
		uploadObj.init( id++ );
	}
};

var Upload = function( uploadType, fileName, fileSize ){
	this.uploadType = uploadType;
	this.fileName = fileName;
	this.fileSize = fileSize;
	// this.dom = null;
};

Upload.prototype.init = function( id ){
	var that = this;
	this.id = id;
	//upload
	console.log("StartUpload:");
	console.log({"filename": this.fileName,
				 "fileSize": this.fileSize});
};
Upload.prototype.delFile = function(){
	if( this.fileSize < 3000 ){
		//remove
	}

	// if( confirm ) //确认后删除
}

startUpload('plugin', [
		{fileName: '1.txt',  fileSize: 1000},
		{fileName: '2.html', fileSize: 3000},
		{fileName: '3.txt',  fileSize: 5000}
	]);
startUpload('flash', [
		{fileName: '4.txt',  fileSize: 1000},
		{fileName: '5.html', fileSize: 3000},
		{fileName: '6.txt',  fileSize: 5000}
	]);

//代码重构:
//uploadObj => 可以被共享
//除了fileName, fileSize根据场景变化, 其他内部状态可以抽象为享元

var Upload_ReModeling = function( uploadType ){
	this.uploadType = uploadType;
};
Upload_ReModeling.prototype.upload = function( id ){
	UploadManger.setExternalState( id, this);
	console.log("StartUpload:");
	console.log({"filename": this.fileName,
				 "fileSize": this.fileSize});
}
Upload_ReModeling.prototype.delFile = function( id ){
	UploadManger.setExternalState( id, this);//将外部信息导入给对象

	//delete 操作
}

var UploadFactory = (function(){
	var createdFlyWeightObjs = {};
	return {
		//uploadType => 内部属性
		create: function( uploadType ){
			if( createdFlyWeightObjs[uploadType] ){
				return createdFlyWeightObjs[uploadType];
			}
			return createdFlyWeightObjs[uploadType] = new Upload_ReModeling(uploadType);
		}
	};
})();

var UploadManger = (function(){
	var uploadDatabase = {};

	return {
		add: function(id, uploadType, fileName, fileSize){
			var flyWeightObj = UploadFactory.create(uploadType);
			uploadDatabase[id] = { //外部属性
				fileName: fileName,
				fileSize: fileSize
			};
			flyWeightObj.upload( id );
		},
		setExternalState: function( id, flyWeightObj ){
			var uploadData = uploadDatabase[ id ];
			for( var i in uploadData){
				flyWeightObj[i] = uploadData[i];//动态添加数据
			}
		}
	};
})();

var id=0;
var startUpload_ReModeling = function( uploadType, files ){
	for( var i=0, file; file = files[i++]; ){
		var uploadObj = UploadManger.add(++id, uploadType, file.fileName, file.fileSize);
	}
};

startUpload_ReModeling('plugin', [
		{fileName: '1.txt',  fileSize: 1000},
		{fileName: '2.html', fileSize: 3000},
		{fileName: '3.txt',  fileSize: 5000}
	]);
startUpload_ReModeling('flash', [
		{fileName: '4.txt',  fileSize: 1000},
		{fileName: '5.html', fileSize: 3000},
		{fileName: '6.txt',  fileSize: 5000}
	]);

//*****共享技术---对象池
//对象池维护一个装载空闲对象的池子
//需要对象的时候 先从对象池中获取 不够再添加新对象

//**通过对象池实现
var objectPoolFactory = function( createObjFn ){
	var objectPool = [];

	return {
		create: function(){
			var obj = objectPool.length === 0 ?
					createObjFn.apply(this, arguments) : objectPool.shift();

			return obj;
		},
		recover: function( obj ){
			objectPool.push(obj);
		}
	};
};

//**实现tooltips
var createTooltip = function(){
	var toolTip = new Object();
	toolTip.name = arguments[0];
	return toolTip;
};

var toolTipPool = objectPoolFactory(createTooltip);

var arr = [];
for( var i=0, str; str = ['a', 'b'][i++]; ){
	var toolTip = toolTipPool.create(str);
	console.log(toolTip.name);
	arr.push(toolTip);
}

for(var i=0, toolTip; toolTip = arr[i++]; ){
	toolTipPool.recover( toolTip);
}

for( var i=0, str; str = ['A', 'B', 'C', 'D'][i++]; ){
	var toolTip = toolTipPool.create(str);
	console.log(toolTip.name);
	arr.push(toolTip);
}

//*****可以自行实践--重构文件上传: 对象池 + 事件委托