//将多个命令组成宏命令
//宏命令与命令再次组装成复杂的命令树
var MarcoCommand = function(){
	return {
		commandsList : [],
		add : function( command ){
			this.commandsList.push(command);
		},
		execute : function(){
			console.log("**Marco Start**");
			for(var i=0, command; command = this.commandsList[i++]; ){
				command.execute();
			}
			console.log("**Marco End**");
		}
	};
}

//宏命令与叶子命令 通过实现相同的execute接口 来隐藏对象身份
//但是js没有类型检测 这里使用throw来约束程序
var leafCommand = {
	execute: function(){
		console.log("leafCom");
	},
	add: function(){
		throw new Error("leaf can not add leaf");
	}
};

var marco = MarcoCommand();
marco.add(leafCommand);

marco.execute();

//******实践--扫描文件夹
//oop 模拟实际情况

var Folder = function( name ){
	this.name = name;
	this.files = [];
	this.parent = null; //引用父对象
};
Folder.prototype.add = function( file ){
	file.parent = this; //设置父对象
	this.files.push( file );
};
Folder.prototype.scan = function(){
	console.log("Start scan. folder:" + this.name);
	for(var i=0, file, files=this.files; file = files[i++]; ){
		file.scan();
	}
};
Folder.prototype.remove = function(){
	if( !this.parent ){
		return;
	}
	for( var files=this.parent.files,l=files.length-1; l>=0; l--){
		var file = files[l];
		if( file === this ){
			files.splice(l, 1);
		}
	}
};

var File = function( name ){
	this.name = name;
	this.parent = null;
};
File.prototype.add = function(){
	throw new Error("file cannot add file");
};
File.prototype.scan = function(){
	console.log("file:" + this.name);
};
File.prototype.remove = function(){
	if( !this.parent ){
		return;
	}
	for( var files=this.parent.files,l=files.length-1; l>=0; l--){
		var file = files[l];
		if( file === this ){
			files.splice(l, 1);
		}
	}
}

var folder = new Folder('学习资料');
var folder1 = new Folder('JavaScript');
var folder2 = new Folder('jQuery');

var file1 = new File('JavaScript设计模式');
var file2 = new File('精通jQuery');
var file3 = new File('重构与模式');

folder1.add(file1);
folder2.add(file2);
folder.add(folder1);
folder.add(folder2);
folder.add(file3);

folder.scan();

//组合模式 => HAS-A 关键是所有叶对象拥有相同的接口
//可以通过双向映射 => 增加修改和删除功能
//可以使用职责链 => 提高组合模式性能

file3.remove();
folder.scan();