$( function() {
	let orgUrl = window.location.href;
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
	/* ================= 排序问题 ================= */
	$(".sortAt").click(function(e) {
		let sortCond = $(this).attr("id");
		let newUrl = changeURLArg(orgUrl, 'sortCond', sortCond);
		window.location.href=newUrl;
	})
	/* ================= 排序问题 ================= */

	/* ======================== 搜索产品号 ======================== */
	$("#pdsearch").on("input", "#iptProduct", function(e) {
		$(".dltOptPd").remove();
		$(".ordTab").show();
		let str = $(this).val()
		let keyword = str.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(keyword.length > 0) {
			$.ajax({
				type: 'GET',
				url: '/bsProductsObtAjax?keyword=' + keyword
			})
			.done(function(results) {
				if(results.success === 1) {
					let pdfirs = results.pdfirs;
					for(let i=0; i<pdfirs.length; i++) {
						addProdToDlt(pdfirs[i])
					}
				} else if(results.success == 2) {
					let pdfir = results.pdfir;
					$(".ordTab").hide();
					$(".pdfir-"+pdfir._id).show();
				}
			})
		}
	})

	let addProdToDlt = function(pdfir) {
		let str = '';
		str += '<option class="dltOptPd" id="dltOptPd-'+pdfir._id+'">'
			str += pdfir.code
		str += '</option>'
		$("#getPdCode").append(str);
	}
	/* ======================== 搜索产品号 ======================== */

	/* ======================== 搜索客户名 ======================== */
	$("#ctersearch").on("input", "#iptCter", function(e) {
		$(".dltOptCter").remove();
		$(".ordTab").show();
		let str = $(this).val()
		let keyword = str.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(keyword.length > 0) {
			$.ajax({
				type: 'GET',
				url: '/bsCtersObtAjax?keyword=' + keyword
			})
			.done(function(results) {
				if(results.success === 1) {
					let cters = results.cters;
					for(let i=0; i<cters.length; i++) {
						addCterToDlt(cters[i])
					}
				} else if(results.success == 2) {
					let cter = results.cter;
					$(".ordTab").hide();
					$(".cter-"+cter._id).show();
				}
			})
		}
	})

	let addCterToDlt = function(cter) {
		let str = '';
		str += '<option class="dltOptCter" id="dltOptCter-'+cter._id+'">'
			str += cter.nome
		str += '</option>'
		$("#getCterCode").append(str);
	}
	/* ======================== 搜索客户名 ======================== */


	/* =========== 点击生产按钮后 判断是否可以取消订单生产 =========== */
	$(".proding").click(function(e) {
		let str = $(this).attr("id");
		let orderId = str.split('-')[1];

		let totship = parseInt($("#totship-"+orderId).val())
		if(totship == 0) {
			$("#cancelForm-"+orderId).toggle();
		}
	})
	/* =========== 点击生产按钮后 判断是否可以取消订单生产 =========== */
} );