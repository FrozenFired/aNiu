$( function() {
	// 显示客户信息
	let tnerElm = function(tners, tnerAjax, isMatch) {
		let str = "";
		for(let i=0; i<tners.length; i++) {
			let tner = tners[i];
			if(tner.note) note = tner.note;
			str += '<div class="'+isMatch+'">'
				str += '<div class="tnerCard m-1 p-2 text-center bg-light" ';
				str += 'id="'+tner.nome+'-'+tner._id+'">';
					str += '<h5 class="text-info">'+ tner.nome +'</h5>';
				str += '</div>'
			str += '</div>'
		}
		$(tnerAjax).append(str);
	}
	$("#ajaxTners").focus(function(e) {
		$(".tnerSel").show()
	})
	// 输入匹配染洗厂
	let matchTner = "";
	$('#formTners').on("input", "#ajaxTners", function(e) {
		matchTner = $(this).val();
		$(".isMatch").remove()
		matchTners();
	})
	let matchTners = function() {
		if(matchTner.length > 0) {
			let keyword = encodeURIComponent(matchTner);
			let keytype = 'nome';
			$.ajax({
				type: 'GET',
				url: '/bsTnersObjAjax?keytype='+keytype+'&keyword=' + keyword
			})
			.done(function(results) {
				if(results.success === 1 && results.tners) {
					tnerElm(results.tners, '.catersAjax', 'isMatch')
				}
			})
		}
	}

	$('.catersAjax').on("click", ".tnerCard", function(e) {
		let strs = ($(this).attr('id')).split('-');
		let tnerName = strs[0];
		let tnerId = strs[1];
		$(".catersAjax").hide()
		$("#formTners").hide()
		$("#tnerBtn").text(tnerName)
		$("#objTner").val(tnerId)
	})
} );