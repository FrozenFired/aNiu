$( function() {
	// 输入匹配客户
	$('#formCters').on("input", "#ajaxCters", function(e) {
		$(".isMatch").remove()
		$(".addCterBtn").remove()

		let matchClient = $(this).val();
		if(matchClient.length > 0) {
			matchCters(matchClient);
		}
	})
	let matchCters = function(matchClient) {
		let keyword = encodeURIComponent(matchClient);
		let keytype = 'nome';
		$.ajax({
			type: 'GET',
			url: '/bsCtersObtAjax?keytype='+keytype+'&keyword=' + keyword
		})
		.done(function(results) {
			if(results.success === 0) {
				alert(results.info)
			} else {
				let str = "";
				let cters = results.cters;

				if(results.success === 1) {
					str += showAddCterBtn();
				} else if(results.success == 2) {
					let cter = results.cter;
					str += showCterElm(cter);
				}
				for(let i=0; i<cters.length; i++) {
					if(cters[i].nome == matchClient) {continue;}
					str += showCterElm(cters[i])
				}
				$('.ctersAjax').append(str);
			}
		})
	}
	// 显示客户信息
	let showCterElm = function(cter) {
		let str = "";
		if(cter.note) note = cter.note;
		str += '<div class="isMatch">'
			str += '<div class="cterCard m-1 p-2 text-center bg-light" ';
			str += 'id="'+cter.nome+'-'+cter._id+'">';
				str += '<h5 class="text-info">'+ cter.nome +'</h5>';
			str += '</div>'
		str += '</div>'
		return str;
	}
	let showAddCterBtn = function() {
		return '<button class="btn btn-warning btn-block mt-2 addCterBtn" type="button">+客户</button>';
	}
	$("#ajaxCters").focus(function(e) {
		$(".cterSel").show()
	})

	$('.ctersAjax').on("click", ".cterCard", function(e) {
		let strs = ($(this).attr('id')).split('-');
		let cterNome = strs[0];
		let cterId = strs[1];
		$(".isMatch").remove()
		$(".addCterBtn").remove()
		$(".ctersAjax").hide()
		$("#formCters").hide()
		$("#cterBtn").text(cterNome)
		$("#objCter").val(cterId)
	})

	$('.ctersAjax').on("click", ".addCterBtn", function(e) {
		let nome = $("#ajaxCters").val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		let keyword = encodeURIComponent(nome);	// 转化码
		$.ajax({
			type: 'GET',
			url: '/bsCterNewAjax?nome='+keyword
		})
		.done(function(results) {
			if(results.success === 0) {
				alert(results.info)
			} else {
				let cter = results.cter;

				$(".isMatch").remove()
				$(".addCterBtn").remove()
				$(".ctersAjax").hide()
				$("#formCters").hide()
				$("#cterBtn").text(cter.nome)
				$("#objCter").val(cter._id)
			}
		})
	})
} );