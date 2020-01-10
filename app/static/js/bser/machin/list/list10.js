$( function() {
	$(".datepicker").datepicker();

	/* ------------------------------- 获取 url 中的参数 -------------------------------- */
	let nowUrl = window.location.href;
	function getUrlParam(name) {
		let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
		let r = window.location.search.substr(1).match(reg);  //匹配目标参数
		if (r != null) return unescape(r[2]); return null; //返回参数值
	}
	/* ------------------------------- 获取 url 中的参数 -------------------------------- */

	/* ------------- 改变 url 中的参数值 -------------- */
	let changeURLArg = function(url,arg,arg_val){
		var pattern=arg+'=([^&]*)';
		var replaceText=arg+'='+arg_val;
		if(url.match(pattern)){
			var tmp='/('+ arg+'=)([^&]*)/gi';
			tmp=url.replace(eval(tmp),replaceText);
			return tmp;
		}else{
			if(url.match('[\?]')){
				return url+'&'+replaceText;
			}else{
				return url+'?'+replaceText;
			}
		}
		return url+'\n'+arg+'\n'+arg_val;
	}
	/* ------------- 改变 url 中的参数值 -------------- */

	/* ------------------------- 时间选择 -------------------------- */
	$("#atFm").change(function(e) {
		/* 优化：如果跟上次比较时间不变，可以不发生事件 */
		// 开始时间值
		let valAtFm = encodeURIComponent($(this).val())
		let newUrl = changeURLArg(nowUrl, 'atFm', valAtFm)
		window.location.href=newUrl;
	})
	$("#atTo").change(function(e) {
		/* 优化：如果跟上次比较时间不变，可以不发生事件 */
		let valAtTo = encodeURIComponent($(this).val())
		// console.log(atFm)
		let newUrl = changeURLArg(nowUrl, 'atTo', valAtTo)
		window.location.href=newUrl;
	})
	/* ------------------------- 时间选择 -------------------------- */




	/* ------------------------- 关键词筛选 -------------------------- */
	$("#ajaxKey").blur(function(e) {		
		let str = $(this).val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		let keyword = encodeURIComponent(str);	// 转化码
		let newUrl = changeURLArg(nowUrl, 'keyword', keyword)
		window.location.href=newUrl;
	})
	/* ------------------------- 关键词筛选 -------------------------- */



	/* ------------------------- Cter 选择 -------------------------- */
	$(".toCter").click(function(e) {
		let valCter = ($(this).attr('id')).split('-')[1];
		// 状态值
		let valStatus = getUrlParam('status')
		let status = '';
		if(valStatus) {
			status = 'status='+valStatus
		}
		// 开始时间值
		let valAtFm = getUrlParam('atFm')
		let atFm = '';
		if(valAtFm) {
			atFm = 'atFm='+valAtFm
		}
		// 结束时间值
		let valAtTo = getUrlParam('atTo')
		let atTo = '';
		if(valAtTo) {
			atTo = 'atTo='+valAtTo
		}
		window.location.href="/bsMacHis?"+status+'&cter='+valCter+'&'+atFm+'&'+atTo;
	})
	$(".cncCter").click(function(e) {
		// 状态值
		let valStatus = getUrlParam('status')
		let status = '';
		if(valStatus) {
			status = 'status='+valStatus
		}
		// 开始时间值
		let valAtFm = getUrlParam('atFm')
		let atFm = '';
		if(valAtFm) {
			atFm = 'atFm='+valAtFm
		}
		// 结束时间值
		let valAtTo = getUrlParam('atTo')
		let atTo = '';
		if(valAtTo) {
			atTo = 'atTo='+valAtTo
		}
		window.location.href="/bsMacHis?"+status+'&'+atFm+'&'+atTo;
	})
	/* ------------------------- Cter 选择 -------------------------- */

} );