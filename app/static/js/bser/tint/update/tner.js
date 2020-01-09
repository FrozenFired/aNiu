$( function() {
	// 显示客户信息
	let tnerElm = function(tners, tnerAjax, isMatch) {
		let str = "";
		for(let i=0; i<tners.length; i++) {
			let tner = tners[i];
			if(tner.note) note = tner.note;
			str += '<div class="'+isMatch+' col-3">'
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
		
	// 输入匹配客户
	let matchClient = "";
	$('#formTners').on("input", "#ajaxTners", function(e) {
		matchClient = $(this).val();
		$(".isMatch").remove()
		matchTners();
	})
	let matchTners = function() {
		if(matchClient.length > 0) {
			let keyword = encodeURIComponent(matchClient);
			let keytype = 'nome';
			$.ajax({
				type: 'GET',
				url: '/ajaxBsTners?keytype='+keytype+'&keyword=' + keyword
			})
			.done(function(results) {
				if(results.success === 1 && results.tners) {
					tnerElm(results.tners, '.tnersAjax', 'isMatch')
				}
			})
		}
	}

	$('.tnersAjax').on("click", ".tnerCard", function(e) {
		let strs = ($(this).attr('id')).split('-');
		let tnerNome = strs[0];
		let tnerId = strs[1];
		let tintId = $("#tintId").val();
		$.ajax({
			type: 'GET',
			url: '/bsTintRelTnerAjax?tintId='+tintId+'&tnerId=' + tnerId
		})
		.done(function(results) {
			if(results.success === 1) {
				$(".isMatch").remove()
				$("#ajaxTners").val('')
				$("#tnerBtn").text(tnerNome)
				$("#objTner").val(tnerId)
			} else {
				alert(results.info)
			}
		})
	})
} );