$(function(){
	/* ------------------------------- 获取 url 中的参数 -------------------------------- */
	function getUrlParam(name) {
		let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
		let r = window.location.search.substr(1).match(reg);  //匹配目标参数
		if (r != null) return unescape(r[2]); return null; //返回参数值
	}
	/* ------------------------------- 获取 url 中的参数 -------------------------------- */

	/* --------- 根据URL参数 操作页面 ---------- */
	let init = function() {
		let preUrl = getUrlParam('preUrl');
		if(preUrl == "bsMacNew" || preUrl == "bsMachinDel") {
			window.location.href="/bsMacs";
		}
	}
	init();
	/* --------- 根据URL参数 操作页面 ---------- */
})