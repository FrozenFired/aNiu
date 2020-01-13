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

	$(".sortAt").click(function(e) {
		let sortCond = $(this).attr("id");
		let newUrl = changeURLArg(orgUrl, 'sortCond', sortCond);
		window.location.href=newUrl;
	})

	$("#pdsearch").on("input", "#iptProduct", function(e) {
		$(".dltOpt").remove();
		$(".pdfir").show();
		let str = $(this).val()
		let keyword = str.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(keyword.length > 0) {
			$.ajax({
				type: 'GET',
				url: '/bsProductsToOrderAjax?keyword=' + keyword
			})
			.done(function(results) {
				if(results.success === 1) {
					let pdfirs = results.pdfirs;
					for(let i=0; i<pdfirs.length; i++) {
						addOptionToDlt(pdfirs[i])
					}
				} else if(results.success == 2) {
					let pdfir = results.pdfir;
					$(".pdfir").hide();
					$(".pdfir-"+pdfir._id).show();
				}
			})
		}
	})

	let addOptionToDlt = function(pdfir) {
		let str = '';
		str += '<option class="dltOpt" id="dltOpt-'+pdfir._id+'">'
			str += pdfir.code
		str += '</option>'
		$("#getPdCode").append(str);
	}

} );