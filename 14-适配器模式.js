//适配器 -> warpper
//解决接口不兼容
var getGuangDongCity = function(){
	var guangdongCity = [
		{
			name: 'shenzhen',
			id: 11
		},
		{
			name: 'guangzhou',
			id: 12
		}
	];
	return guangdongCity;
}

var render = function(fn){
	console.log("Render");
	console.log( JSON.stringify( fn() ) );
}

render(getGuangDongCity);

//适配器
var addressAdapter = function( oldAddressfn ){
	var address = {},
		oldAddress = oldAddressfn();
	for( var i=0, c; c=oldAddress[i++]; ){
		address[c.name] = c.id;
	}
	return function(){
		return address;
	}
};
render(addressAdapter(getGuangDongCity));

//对于数据结构发生变化时 不需要改变html模板 
//而是对数据结构进行适配