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
		$(".macTab").show();
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
					$(".macTab").hide();
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

	/* ======================== 搜索工厂名 ======================== */
	$("#fdersearch").on("input", "#iptFder", function(e) {
		$(".dltOptFder").remove();
		$(".macTab").show();
		let str = $(this).val()
		let keyword = str.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(keyword.length > 0) {
			$.ajax({
				type: 'GET',
				url: '/bsFdersObtAjax?keyword=' + keyword
			})
			.done(function(results) {
				if(results.success === 1) {
					let fders = results.fders;
					for(let i=0; i<fders.length; i++) {
						addFderToDlt(fders[i])
					}
				} else if(results.success == 2) {
					let fder = results.fder;
					$(".macTab").hide();
					$(".fder-"+fder._id).show();
				}
			})
		}
	})

	let addFderToDlt = function(fder) {
		let str = '';
		str += '<option class="dltOptFder" id="dltOptFder-'+fder._id+'">'
			str += fder.nome
		str += '</option>'
		$("#getFderNome").append(str);
	}
	/* ======================== 搜索工厂名 ======================== */

} );