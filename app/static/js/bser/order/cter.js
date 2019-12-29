$( function() {
	// 显示客户信息
	let cterElm = function(cters, cterAjax, isMatch) {
		let str = "";
		for(let i=0; i<cters.length; i++) {
			let cter = cters[i];
			if(cter.note) note = cter.note;
			str += '<div class="'+isMatch+'">'
				str += '<div class="cterCard m-1 p-2 text-center bg-light" ';
				str += 'id="'+cter.nome+'-'+cter._id+'">';
					str += '<h5 class="text-info">'+ cter.nome +'</h5>';
				str += '</div>'
			str += '</div>'
		}
		$(cterAjax).append(str);
	}
	$("#ajaxCters").focus(function(e) {
		$(".cterSel").show()
	})
		
	// 输入匹配客户
	let matchClient = "";
	$('#formCters').on("input", "#ajaxCters", function(e) {
		matchClient = $(this).val();
		$(".isMatch").remove()
		matchCters();
	})
	let matchCters = function() {
		if(matchClient.length > 0) {
			let keyword = encodeURIComponent(matchClient);
			let keytype = 'nome';
			$.ajax({
				type: 'GET',
				url: '/ajaxBsCters?keytype='+keytype+'&keyword=' + keyword
			})
			.done(function(results) {
				if(results.success === 1 && results.cters) {
					cterElm(results.cters, '.ctersAjax', 'isMatch')
				}
			})
		}
	}

	$('.ctersAjax').on("click", ".cterCard", function(e) {
		let strs = ($(this).attr('id')).split('-');
		let cterNome = strs[0];
		let cterId = strs[1];
		$(".ctersAjax").hide()
		$("#formCters").hide()
		$("#cterBtn").text(cterNome)
		$("#objCter").val(cterId)
	})
} );