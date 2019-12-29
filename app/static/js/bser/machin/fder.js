$( function() {
	// 显示客户信息
	let fderElm = function(fders, fderAjax, isMatch) {
		let str = "";
		for(let i=0; i<fders.length; i++) {
			let fder = fders[i];
			if(fder.note) note = fder.note;
			str += '<div class="'+isMatch+'">'
				str += '<div class="fderCard m-1 p-2 text-center bg-light" ';
				str += 'id="'+fder.nome+'-'+fder._id+'">';
					str += '<h5 class="text-info">'+ fder.nome +'</h5>';
				str += '</div>'
			str += '</div>'
		}
		$(fderAjax).append(str);
	}
	$("#ajaxFders").focus(function(e) {
		$(".fderSel").show()
	})
		
	// 输入匹配客户
	let matchClient = "";
	$('#formFders').on("input", "#ajaxFders", function(e) {
		matchClient = $(this).val();
		$(".isMatch").remove()
		matchFders();
	})
	let matchFders = function() {
		if(matchClient.length > 0) {
			let keyword = encodeURIComponent(matchClient);
			let keytype = 'nome';
			$.ajax({
				type: 'GET',
				url: '/ajaxBsFders?keytype='+keytype+'&keyword=' + keyword
			})
			.done(function(results) {
				if(results.success === 1 && results.fders) {
					fderElm(results.fders, '.fdersAjax', 'isMatch')
				}
			})
		}
	}

	$('.fdersAjax').on("click", ".fderCard", function(e) {
		let strs = ($(this).attr('id')).split('-');
		let fderName = strs[0];
		let fderId = strs[1];
		$(".fdersAjax").hide()
		$("#formFders").hide()
		$("#fderBtn").text(fderName)
		$("#objFder").val(fderId)
	})
} );