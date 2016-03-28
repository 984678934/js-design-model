var gets = function(cb){
	var EXIT = 1;

	process.stdin.resume();
	process.stdin.setEncoding('utf-8');
	process.stdin.on('data', function(chunk){
		//process.stdin.pause(); 取消暂停后输入流会一直存在 直到进程结束
		if(!EXIT){
			EXIT = 1;
			return process.stdin.pause();
		}
		if(chunk.trim() === ''){
			cb(chunk);
			return EXIT--;
		} //连续两次控制输入退出输入流的监听
		cb(chunk);
	});
};

exports.gets = gets;